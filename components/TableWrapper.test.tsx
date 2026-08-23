import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TableWrapper from './TableWrapper'

/**
 * Characterisation tests for the MDX table wrapper, which adds horizontal
 * scrolling around wide tables.
 */
describe('TableWrapper', () => {
  it('wraps children in a scrollable div containing a table', () => {
    render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </TableWrapper>
    )

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(table.parentElement).toHaveClass('w-full', 'overflow-x-auto')
  })

  it('places the children inside the table element', () => {
    render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </TableWrapper>
    )

    expect(screen.getByRole('table')).toContainElement(screen.getByText('Cell'))
  })
})
