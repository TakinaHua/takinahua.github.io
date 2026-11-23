import type { DateRange as Range } from './content'

export default function DateRange({ start, end }: Range) {
  return (
    <>
      <time dateTime={start.dateTime}>{start.label}</time>
      {' to '}
      {end === 'present' ? 'present' : <time dateTime={end.dateTime}>{end.label}</time>}
    </>
  )
}
