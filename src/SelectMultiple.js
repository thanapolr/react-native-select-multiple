import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, FlatList, Text, TouchableWithoutFeedback, Image } from 'react-native'
import styles from './SelectMultiple.styles'
import checkbox from '../images/icon-checkbox.png'
import checkboxChecked from '../images/icon-checkbox-checked.png'
import { mergeStyles, styledRow } from './style'

const itemType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ label: PropTypes.any, value: PropTypes.any })
])

const styleType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.number,
  PropTypes.array
])
const rowStyleType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.number,
  PropTypes.array,
  PropTypes.func
])

const sourceType = PropTypes.oneOfType([PropTypes.object, PropTypes.number])

// A customizable FlatList that allows you to select multiple rows
export default class SelectMultiple extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(itemType).isRequired,
    selectedItems: PropTypes.arrayOf(itemType),
    maxSelect: PropTypes.number,
    onSelectionsChange: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func,

    checkboxSource: sourceType,
    selectedCheckboxSource: sourceType,
    renderLabel: PropTypes.func,
    flatListProps: PropTypes.any,
    style: styleType,
    rowStyle: rowStyleType,
    checkboxStyle: rowStyleType,
    labelStyle: rowStyleType,

    selectedRowStyle: rowStyleType,
    selectedCheckboxStyle: rowStyleType,
    selectedLabelStyle: rowStyleType
  }

  static defaultProps = {
    selectedItems: [],
    style: {},
    rowStyle: {},
    checkboxStyle: {},
    checkboxCheckedStyle: {},
    labelStyle: {},
    maxSelect: null,
    checkboxSource: checkbox,
    selectedCheckboxSource: checkboxChecked,
    renderLabel: null
  }

  constructor (props) {
    super(props)
    this.state = { dataSource: [] }
  }

  componentDidMount () {
    const rows = this.getRowData(this.props)
    this.setState({ dataSource: rows })
  }

  componentWillReceiveProps (nextProps) {
    const rows = this.getRowData(nextProps)
    this.setState({ dataSource: rows })
  }

  getRowData ({ items, selectedItems }) {
    items = items.map(this.toLabelValueObject)
    selectedItems = (selectedItems || []).map(this.toLabelValueObject)

    items.forEach((item) => {
      item.selected = selectedItems.some((i) => i.value === item.value)
    })

    return items
  }

  onRowPress (row) {
    const { label, value } = row
    let { selectedItems, maxSelect } = this.props

    selectedItems = (selectedItems || []).map(this.toLabelValueObject)

    const index = selectedItems.findIndex((selectedItem) => selectedItem.value === value)

    if (index > -1) {
      selectedItems = selectedItems.filter((selectedItem) => selectedItem.value !== value)
    } else {
      if (maxSelect != null && selectedItems.length >= maxSelect) {
        return
      } else {
        selectedItems = selectedItems.concat({ label, value })
      }
    }

    this.props.onSelectionsChange(selectedItems, { label, value })
  }

  toLabelValueObject (obj) {
    if (Object.prototype.toString.call(obj) === '[object String]') {
      return { label: obj, value: obj }
    } else {
      return { label: obj.label, value: obj.value }
    }
  }

  keyExtractor = (item, index) => index.toString()

  render () {
    const { dataSource } = this.state
    const { style, flatListProps, keyExtractor } = this.props
    return (
      <FlatList
        style={style}
        keyExtractor={keyExtractor || this.keyExtractor}
        data={dataSource}
        renderItem={this.renderItemRow}
        {...flatListProps}
      />
    )
  }

  renderLabel = (label, style, selected) => {
    if (this.props.renderLabel) {
      return this.props.renderLabel(label, style, selected)
    }
    return (
      <Text style={style}>{label}</Text>
    )
  }

  renderItemRow = (row) => {
    let {
      checkboxSource,
      rowStyle,
      labelStyle,
      checkboxStyle
    } = this.props

    const {
      selectedCheckboxSource,
      selectedRowStyle,
      selectedCheckboxStyle,
      selectedLabelStyle
    } = this.props

    if (row.item.selected) {
      checkboxSource = selectedCheckboxSource

      rowStyle = mergeStyles(styles.row, styledRow(row, rowStyle), styledRow(row, selectedRowStyle))
      checkboxStyle = mergeStyles(styles.checkbox, styledRow(row, checkboxStyle), styledRow(row, selectedCheckboxStyle))
      labelStyle = mergeStyles(styles.label, styledRow(row, labelStyle), styledRow(row, selectedLabelStyle))
    } else {
      rowStyle = mergeStyles(styles.row, styledRow(row, rowStyle))
      checkboxStyle = mergeStyles(styles.checkbox, styledRow(row, checkboxStyle))
      labelStyle = mergeStyles(styles.label, styledRow(row, labelStyle))
    }

    return (
      <TouchableWithoutFeedback onPress={() => this.onRowPress(row.item)}>
        <View style={rowStyle}>
          <Image style={checkboxStyle} source={checkboxSource} />
          {this.renderLabel(row.item.label, labelStyle, row.item.selected)}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}
