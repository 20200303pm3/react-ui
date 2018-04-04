import React, { Component } from 'react'
import './SimpleDropdownMenu.css'

const sampleData = [
  'Apple',
  'Samsung',
  'Xiaomi',
]

class SimpleDropdownMenuItem extends Component {
  selectItem = () => {
    const {
      selectItem,
      toggleMenu,
      value,
    } = this.props

    selectItem(value)
    toggleMenu()
  }

  render () {
    const {
      value,
    } = this.props

    return (
      <li
        className='simple-dropdown__item'
        onClick={this.selectItem}
      >
        { value }
      </li>
    )
  }
}

class SimpleDropdownMenu extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isShowingMenu: false,
      selectedItem: null,
    }
  }

  toggleMenu = () => {
    const {
      isShowingMenu,
    } = this.state

    this.setState({
      isShowingMenu: !isShowingMenu,
    })
  }

  selectItem = (value) => {
    this.setState({
      selectedItem: value,
    })
  }

  render() {
    const {
      isShowingMenu,
    } = this.state

    return (
      <div className='simple-dropdown'>
        <p
          className={`simple-dropdown__box${isShowingMenu ? ' active' : ''}`}
          onClick={this.toggleMenu}
        >
          { this.state.selectedItem }
        </p>
        <ul className={`simple-dropdown__menu${isShowingMenu ? ' active' : ''}`}>
          {
            sampleData.map((item, index) => {
              return <SimpleDropdownMenuItem
                key={index}
                value={item}
                selectItem={this.selectItem}
                toggleMenu={this.toggleMenu}
              />
            })
          }
        </ul>
      </div>
    )
  }
}

export default SimpleDropdownMenu
