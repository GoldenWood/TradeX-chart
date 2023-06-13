// divider.js
// dragable divider to resize chart panes

import DOM from "../../utils/DOM"
import { isNumber } from "../../utils/typeChecks"
import Input from "../../input"

import {
  CLASS_DIVIDERS
} from "../../definitions/core"
import {
  DIVIDERHEIGHT
} from "../../definitions/chart"


export default class Divider {

  #id
  #core
  #config
  #theme
  #widgets
  #chartPane

  #elDividers
  #elDivider

  #cursorPos
  #input

  static dividerList = {}
  static divideCnt = 0
  static class = CLASS_DIVIDERS
  static name = "Dividers"
  static type = "divider"

  static create(widgets, config) {

    const id = `${config.core.id}_divider_${++Divider.divideCnt}`
    config.id = id

    // add entry
    Divider.dividerList[id] = new Divider(widgets, config)

    return Divider.dividerList[id]
  }

  static destroy() {
    // destroy all dividers
    for (let id in Divider.dividerList) {
      Divider.dividerList[id].destroy()
    }
    // remove entry
    delete Divider.dividerList[id]
  }

  static defaultNode() {
    const dividersStyle = `position: absolute;`
    const node = `
  <div slot="widget" class="${CLASS_DIVIDERS}" style="${dividersStyle}"></div>
  `
    return node
  }

  constructor(widgets, config) {

    const cfg = {...config}

    this.#widgets = widgets
    this.#core = cfg.core
    this.#config = cfg
    this.#theme = cfg.core.theme
    this.#id = cfg.id
    this.#chartPane = cfg.chartPane
    this.#elDividers = widgets.elements.elDividers
    this.init()
  }

  get el() { return this.#elDivider }
  get id() { return this.#id }
  get chartPane() { return this.#chartPane }
  get config() { return this.#core.config }
  get pos() { return this.dimensions }
  get dimensions() { return DOM.elementDimPos(this.#elDivider) }
  get height() { return this.#elDivider.getBoundingClientRect().height }

  init() {
    // insert element
    this.mount()
  }

  start() {
    // set mouse pointer
    this.setCursor("n-resize")

    // set up event listeners
    this.eventsListen()
  }

  destroy() {
    // remove event listeners
    this.#input.destroy()
    // remove element
    this.el.remove()
    // remove entry from list
    delete Divider.dividerList[this.id]
  }

  eventsListen() {
    this.#input = new Input(this.#elDivider, {disableContextMenu: false});

    this.#input.on("pointerover", this.onMouseEnter.bind(this));
    this.#input.on("pointerout", this.onMouseOut.bind(this));
    this.#input.on("pointerdrag", this.onPointerDrag.bind(this));
    this.#input.on("pointerdragend", this.onPointerDragEnd.bind(this));
  }

  on(topic, handler, context) {
    this.#core.on(topic, handler, context)
  }

  off(topic, handler) {
    this.#core.off(topic, handler)
  }

  emit(topic, data) {
    this.#core.emit(topic, data)
  }

  onMouseEnter() {
    this.#elDivider.style.background = this.#theme.divider.active
    this.#core.MainPane.onMouseEnter()
  }

  onMouseOut() {
    this.#elDivider.style.background = this.#theme.divider.idle
    this.#core.MainPane.onMouseEnter()
  }

  onPointerDrag(e) {
    this.#cursorPos = [e.position.x, e.position.y]
    this.emit(`${this.id}_pointerdrag`, this.#cursorPos)
    this.emit(`divider_pointerdrag`, {
      id: this.id,
      e: e,
      pos: this.#cursorPos,
      chartPane: this.chartPane
    })
  }

  onPointerDragEnd(e) {
    if ("position" in e)
    this.#cursorPos = [e.position.x, e.position.y]
    this.emit(`${this.id}_pointerdragend`, this.#cursorPos)
    this.emit(`divider_pointerdragend`, {
      id: this.id,
      e: e,
      pos: this.#cursorPos,
      chartPane: this.chartPane
    })
  }

  mount() {
    if (this.#elDividers.lastElementChild == null)
      this.#elDividers.innerHTML = this.dividerNode()
    else
      this.#elDividers.lastElementChild.insertAdjacentHTML("afterend", this.dividerNode())

    this.#elDivider = DOM.findBySelector(`#${this.#id}`, this.#elDividers)
  }

  setCursor(cursor) {
    this.#elDivider.style.cursor = cursor
  }

  dividerNode() {
    let top = this.#chartPane.pos.top - DOM.elementDimPos(this.#elDividers).top,
      width = this.#core.MainPane.rowsW + this.#core.scaleW,
      height = (isNumber(this.config.dividerHeight)) ? 
        this.config.dividerHeight : DIVIDERHEIGHT,
      left = this.#core.theme.tools.width // this.#core.toolsW;
      top -= height / 2

    switch(this.#core.theme.tools.location) {
      case "left": break;
      case false:
      case "none":
      case "right": left *= -1; break;
      default: break
    }

    const styleDivider = `position: absolute; top: ${top}px; left: ${left}px; z-index:100; width: ${width}px; height: ${height}px; background: ${this.#theme.divider.idle};`

    const node = `
      <div id="${this.#id}" class="divider" style="${styleDivider}"></div>
    `
    return node
  }

  updatePos(pos) {
    let dividerY = this.#elDivider.offsetTop;
        dividerY += pos[5]
    this.#elDivider.style.top = `${dividerY}px`
  }

  setPos() {
    let top = this.#chartPane.pos.top - DOM.elementDimPos(this.#elDividers).top;
        top = top - (this.height / 2)
    this.#elDivider.style.top = `${top}px`
  }

  hide() {
    this.#elDivider.style.display = `none`
  }

  show() {
    this.#elDivider.style.display = `block`
  }
}
