class Drag {
  dom = null
  xPum = '' 
  yPum = ''
  flags = false
  position = { x: 0, y: 0 }
  nx = '' 
  ny = '' 
  dx = 0 
  dy = 0 
  config = {
    xDrag: true, // x方向拖动
    yDrag: true, // y方向拖动
    x: 0, // x默认位置
    y: 0, // y默认位置
    xDistance: {min: null, max: null}, // x轴方向拖动范围
    yDistance: {min: null, max: null}, // y轴方向拖动范围
    banDom: null, // 禁止滚动的dom，在可拖动元素后面有滚动内容的时候使用
    recoilTime: 300, // 超出范围后的回弹时间(毫秒 100 - 1000)
    damping: 0.3, // 超过限制距离后的阻尼系数(0 - 1)
  }

  constructor(dom, useConfig = {}) {
    this.dom = this.getDom(dom) // 获取dom
    this.config = {
      ...this.config,
      ...useConfig
    } //合并配置项

    this.verification() // 验证默认参数是否有误

    // 设置默认位置
    this.setDefaultLocation()
    
    // 绑定事件
    this.addEvent('mousedown', this.down)
    this.addEvent('touchstart', this.down)
    this.addEvent('mousemove', this.move)
    this.addEvent('touchmove', this.move)
    this.addEvent('mouseup', this.end)
    this.addEvent('touchend', this.end)

    
    //阻止页面的滑动默认事件
    if(this.config.banDom) {
      this.getDom(this.config.banDom).addEventListener(
        'touchmove',
        (event) => {
          if(this.flags) {
            event.preventDefault && event.preventDefault()
            event.stopPropagation && event.stopPropagation()
          }
        },
        false
      )
    }
  }

  addEvent(event, fun) {
    this.dom.addEventListener(event, fun.bind(this), false)
  }

  /**
   *设置默认位置
   */
  setDefaultLocation() {
    this.dom.style.transition = `transform ${this.config.recoilTime}ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s`
    let x = 0, y = 0
    if(this.config.xDrag) {
      x = this.config.x
    }
    if(this.config.yDrag) {
      y = this.config.y
    }
    this.dom.style.transform = `translate(${x}px, ${y}px)`
  }

  /**
   * 校验参数是否合法
   */
  verification() {
    let c = this.config
    if(c.xDistance.min !== null && c.xDistance.max !== null && c.xDistance.min > c.xDistance.max) {
      c.xDistance = {min: 0, max: 0}
      throw new Error("拖动范围参数有误：最小值不能大于最大值")
    }
    if(c.yDistance.min !== null && c.yDistance.max !== null && c.yDistance.min > c.yDistance.max) {
      c.yDistance = {min: 0, max: 0}
      throw new Error("拖动范围参数有误：最小值不能大于最大值")
    }
    if(
      c.xDrag &&
      (c.xDistance.max !== null && c.xDistance.max < c.x) || 
      (c.xDistance.min !== null && c.xDistance.min > c.x)
    ) {
      c.x = 0
      throw new Error("默认位置设置有误，不在可拖动范围内")
    }
    if(
      (c.yDistance.max !== null && c.yDistance.max < c.y) || 
      (c.yDistance.min !== null && c.yDistance.min > c.y)
    ) {
      c.y = 0
      throw new Error("默认位置设置有误，不在可拖动范围内")
    }
    if(c.recoilTime > 1000 || c.recoilTime < 100) {
      c.recoilTime = 300
      throw new Error("回弹时间不在范围：100 - 1000")
    }
    if(c.damping > 1 || c.damping < 0) {
      c.damping = 0.5
      throw new Error("阻尼系数不在范围：0 - 1")
    }
  }

  /**
   * 获取dom元素
   * @param {String} dom
   */
  getDom(dom) {
    var isDOM =
      typeof HTMLElement === "object"
        ? function(obj) {
            return obj instanceof HTMLElement
          }
        : function(obj) {
            return (
              obj &&
              typeof obj === "object" &&
              obj.nodeType === 1 &&
              typeof obj.nodeName === "string"
            )
          }
    if (isDOM(dom)) {
      return dom
    } else if (isDOM(document.querySelector(dom))) {
      return document.querySelector(dom)
    }
    throw new Error("dom元素获取失败")
  }

  /**
   * 手指或鼠标按下
   */
  down(event) {
    this.flags = true
    var touch
    if (event.touches) {
      touch = event.touches[0]
    } else {
      touch = event
    }

    this.position.x = touch.clientX
    this.position.y = touch.clientY
    // 取默认的transform
    if(this.dom.style.transform) {
      let translate = this.getTransform(this.dom)
      this.dx = +translate[0]
      this.dy = +translate[1]
    }

    // 去掉transition属性
    this.dom.style.transition = 'none'
  }

  /**
   * 获取transform值
   */
  getTransform(dom) {
    // 判断有没有translate
    let i = dom.style.transform.indexOf('translate(')
    if(dom.style.transform && i !== -1) {
      // 找到并去掉translate及前面的内容，防止translate不是在最前面
      let position = dom.style.transform.slice(i + 10)
      let i2 = position.indexOf(')') // 找到第一个反括号的位置
      position = position.slice(0, i2) // 去掉反括号后面的所有内容
      return position.replace(/px/g, '').split(', ')
    }
    return [0, 0]
  }

  /**
   * 手指或鼠标移动
   */
  move() {
    var touch = event.touches ? event.touches[0] : event

    this.nx = touch.clientX - this.position.x
    this.ny = touch.clientY - this.position.y
    
    // 内容滚动问题，待完善
    // if(this.ny > 0 && this.dom.scrollTop == 0) {
    //   this.flags = true
    // }
    // if(this.ny < 0 && this.dom.scrollTop == 2136) {
    //   this.flags = true
    // }

    if (this.flags) {

      this.xPum = this.dx
      if(this.config.xDrag) {  // 判断是否开启某一方向的拖拽，是否超出范围
        this.xPum = this.dx + this.nx
        this.xPum = this.dx + this.nx
        let {max, min} = this.config.xDistance
        if(
          (this.xPum > max && max !== null) || 
          (this.xPum < min && min !== null)
        ) { // 是否超出范围
          this.xPum = this.dx + this.nx * this.config.damping
        }
      }
      
      this.yPum = this.dy
      if(this.config.yDrag) {  // 判断是否开启某一方向的拖拽，是否超出范围
        this.yPum = this.dy + this.ny
        let {max, min} = this.config.yDistance
        if(
          (this.yPum > max && max !== null) || 
          (this.yPum < min && min !== null)
        ) { // 是否超出范围
          this.yPum = this.dy + this.ny * this.config.damping
        }
      }

      this.position.x = touch.clientX  // 保存上一次的移动位置
      this.position.y = touch.clientY  // 保存上一次的移动位置
      this.dx = this.xPum
      this.dy = this.yPum

      this.dom.style.transform = `translate(${this.xPum}px, ${this.yPum}px)`
    }
  }

  /**
   * 手指或鼠标抬起
   */
  end() {
    // 添加transition属性
    this.dom.style.transition = `transform ${this.config.recoilTime}ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s`
    
    
    // 两个方向的超出回弹
    let {max: ymax, min: ymin} = this.config.yDistance
    if( this.yPum > ymax && ymax !== null ) { // 是否超出范围
      this.yPum = ymax
    } else if( this.yPum < ymin && ymin !== null ) { 
      this.yPum = ymin
    }

    let {max: xmax, min: xmin} = this.config.xDistance
    if( this.xPum > xmax && xmax !== null ) { // 是否超出范围
      this.xPum = xmax
    } else if( this.xPum < xmin && xmin !== null ) { 
      this.xPum = xmin
    }

    this.dom.style.transform = `translate(${this.xPum}px, ${this.yPum}px)`

    this.flags = false
  }
}

export default Drag
