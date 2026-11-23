"""Lossless looping APNG export and frame-by-frame verification."""
import struct
import zlib

from PIL import Image, ImageChops


def write_preview(path, times, durations, scene):
    # Stream sparse APNG deltas. This keeps memory bounded for the long loop.
    with path.open("wb") as out:
        def chunk(kind, data):
            out.write(struct.pack(">I", len(data)) + kind + data)
            out.write(struct.pack(">I", zlib.crc32(kind + data)))

        out.write(bytes.fromhex("89504e470d0a1a0a"))
        chunk(b"IHDR", struct.pack(">IIBBBBB", 1280, 720, 8, 6, 0, 0, 0))
        chunk(b"acTL", struct.pack(">II", len(times), 0))
        seq = 0
        previous = None
        for ms, duration in zip(times, durations):
            current = scene(ms)
            x = y = 0
            if previous is None:
                patch = current.convert("RGBA")
            else:
                delta = ImageChops.difference(current, previous)
                box = delta.getbbox() or (0, 0, 1, 1)
                x, y = box[:2]
                channels = delta.crop(box).split()
                mask = ImageChops.lighter(ImageChops.lighter(*channels[:2]), channels[2])
                patch = Image.new("RGBA", mask.size)
                patch.paste(current.crop(box), (0, 0), mask.point(lambda v: 255 if v else 0))
            chunk(b"fcTL", struct.pack(">IIIIIHHBB", seq, *patch.size, x, y,
                                       duration, 1000, 0, int(previous is not None)))
            seq += 1
            raw = patch.tobytes()
            stride = patch.width * 4
            data = zlib.compress(b"".join(b"\0" + raw[j:j+stride]
                                          for j in range(0, len(raw), stride)))
            if previous is None:
                chunk(b"IDAT", data)
            else:
                chunk(b"fdAT", struct.pack(">I", seq) + data)
                seq += 1
            previous = current
        chunk(b"IEND", b"")
    # Check the decoded preview including frame disposal, cadence and enlargement.
    with Image.open(path) as preview:
        assert preview.n_frames == len(times)
        for i, ms in enumerate(times):
            preview.seek(i)
            assert preview.info["duration"] == durations[i]
            assert ImageChops.difference(preview.convert("RGB"), scene(ms)).getbbox() is None
