// merge the passed styles into a flat array
export function mergeStyles () {
  return Array.prototype.concat.apply([], arguments)
}

export function styledRow (row, style) {
  if (typeof style === 'function') {
    return style(row)
  } else {
    return style
  }
}
