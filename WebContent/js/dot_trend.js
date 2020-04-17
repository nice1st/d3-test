/**
 * 
 * 최영화K
 */
var d3RealtimeMessage = function($container, option) {
  
  var chartData = [];
  var _properties = null;
  
  var w, h, marginTop, marginBottom, marginLef, marginRight, contentsWidth, contentsHeight;
  var tickInterval = 1000, tickCount = 300;
  
  var dragBehavior = d3.drag()
                      .on("drag", dragged)
                      .on("start", dragStarted)
                      .on("end", dragEnded);
  
  function calcAndSetSize(option) {
    w = option.width, h = option.height
    , marginTop = 15, marginBottom = 20, marginLeft = 30, marginRight = 15
    , contentsWidth = w - marginLeft - marginRight, contentsHeight = h - marginTop - marginBottom
  };
  calcAndSetSize(option);
  
  var init = function() {

    var transition = d3.transition().duration(0);
    
    var svg = d3.select($container.selector)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .call(dragBehavior)
      ;
    
    var tooltip = d3.select($container.selector)
      .append("div")
      .attr("class", "d3-tooltip")
      .style("display", "none")
      .style("position", "fixed");
    
    var chartG = svg.append("g")
      .attr("transform", "translate("+marginLeft+", "+marginTop+")");
    
    var xScale = d3.scaleTime();
    var yScale = d3.scaleLinear().domain([0, 100]);
    var now = new Date();
    var xAxis = d3.axisBottom().scale(xScale).ticks(d3.timeMillisecond.every((tickInterval * tickCount) / 10)).tickFormat(d3.timeFormat("%M:%S"));
    var getYAxis = function() {
      return d3.axisLeft().scale(yScale);
    }
    
    chartG.append("g")
      .attr("class", "gridline");
    
    chartG.append("g")
      .attr("class", "contentContainer");

    chartG.append("g")
      .attr("class", "x axis");
    
    chartG.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0, 0)");
    
    _properties = {
        svg: svg
        , tooltip: tooltip
        , chartG: chartG
        , xScale: xScale
        , yScale: yScale
        , xAxis: xAxis
        , getYAxis: getYAxis
    };
  };

  var add = function(data) {
    
    var idx = 0;
    while (chartData.length + 1 > 5000 && idx < chartData.length) { // chartData.length + datas.length
      if (chartData[idx].value < 50) {
        chartData.splice(idx, 1);
      }
      idx++;
    }
    chartData.push(data);
  };
  
  function update() {
    
    if (_properties == null) {
      return;
    }
    
    var now = new Date();
    _properties.xScale.domain([new Date(now.getTime() - (tickInterval * tickCount)), now])
          .range( [ 0, (contentsWidth - ((contentsWidth / tickCount) / 2)) ] );
    _properties.yScale.range([contentsHeight, 0]);
    
    _properties.svg
      .attr("width", w)
      .attr("height", h);
    
    updateValue();
    updateAxis();
  };

  function updateAxis() {
    var gridline = _properties.chartG.select(".gridline")
      .call(_properties.getYAxis().tickSize(-contentsWidth).tickFormat(""));
    
    gridline.selectAll("line").style("stroke", "#262D36");
    
    var xAxis = _properties.chartG.select(".x.axis")
      .attr("transform", "translate(0, " + contentsHeight + ")")
      .call(_properties.xAxis);
      
    xAxis.selectAll("line").style("stroke", "#252D38");
    xAxis.selectAll("path").style("stroke", "#252D38");
    
    var yAxis = _properties.chartG.select(".y.axis")
      .call(_properties.getYAxis());
    
    yAxis.selectAll("line").style("stroke", "#252D38");
    yAxis.selectAll("path").style("stroke", "#252D38");
  };
  
  function updateValue() {
    var circle = _properties.chartG.select("g.contentContainer").selectAll("circle").data(chartData);
    
    circle.exit().remove();
    circle.enter().append("circle").merge(circle)
      .attr("cx", function(d, i) {
        return _properties.xScale(new Date(d.time));
      })
      .attr("cy", function(d) {
        return _properties.yScale(d.value);
      })
      .attr("r", 2)
      .attr("fill", function(d) {
        return d.colorClass;
      });
      
      circle.on("mouseover", function(d, i) {
        isLoop = false;
        showTooltip(d);
        $container.trigger("onNodeMouseover", [d3.select(this), d]);
      }).on("mouseout", function(d, i) {
        isLoop = true;
        $container.trigger("onNodeMouseout", [d3.select(this), d]);
        hideTooltip(d);
      });
      
//       circle.on("mousedown", function() {
//         isLoop = false;
//         $container.trigger("onNodeClick", [d3.select(this)]);
//       }).on("dblclick", function(d, i) {
//         isLoop = false;
//         $container.trigger("onNodeDblclick", [d3.select(this), d]);
//       });
  };
  
  var resize = function(option) {
    calcAndSetSize(option);
    update();
  };
  
  
  var dragRect = {
    element     : null,
    previousElement : null,
    currentY    : 0,
    currentX    : 0,
    originX     : 0,
    originY     : 0,
    setElement: function(ele) {
      this.previousElement = this.element;
      this.element = ele;
    },
    getNewAttributes: function() {
      var x = this.currentX<this.originX?this.currentX:this.originX;
      var y = this.currentY<this.originY?this.currentY:this.originY;
      var width = Math.abs(this.currentX - this.originX);
      var height = Math.abs(this.currentY - this.originY);
      return {
        x       : x,
        y       : y,
        width   : width,
        height  : height
      };
    },
    init: function(newX, newY) {
      var rectElement = _properties.svg.append("rect")
                        .attr("rx", 4)
                        .attr("ry", 4)
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("class", "selection")
                        .style("stroke", "#0078D7")
                        .style("stroke-width", 2)
                        .style("fill", "#0078D7")
                        .style("fill-opacity", 0.3)
                        ;
      this.setElement(rectElement);
      this.originX = newX;
      this.originY = newY;
      this.update(newX, newY);
      isLoop = false;
    },
    update: function(newX, newY) {
      this.currentX = newX;
      this.currentY = newY;
      
      var newAttr = this.getNewAttributes();
      this.element
          .attr("x", newAttr.x)
          .attr("y", newAttr.y)
          .attr("width", newAttr.width)
          .attr("height", newAttr.height)
    },
    remove: function() {
      this.element.remove();
      this.element = null;
      isLoop = true;
    },
    removePrevious: function() {
      if(this.previousElement) {
        this.previousElement.remove();
      }
    }
  };
  
  function dragStarted() {
    var p = d3.mouse(this);
    dragRect.init(p[0], p[1]);
    dragRect.removePrevious();
  };

  function dragged() {
    var p = d3.mouse(this);
    dragRect.update(p[0], p[1]);
  };

  function dragEnded() {
    var dragRectAttr = dragRect.getNewAttributes();
    var datas = [];
    _properties.chartG.select("g.contentContainer").selectAll("circle").each(function(d,i) {
      var cx = Number(d3.select(this).attr("cx")) + marginLeft;
      var cy = Number(d3.select(this).attr("cy")) + marginTop;
      
      if ((cx >= dragRectAttr.x && cx <= (dragRectAttr.x + dragRectAttr.width)) && (cy >= dragRectAttr.y && cy <= (dragRectAttr.y + dragRectAttr.height))) {
        datas.push(d);
      }
    });
    $container.trigger("onDragEnd", [datas]);
    
    d3.event.sourceEvent.preventDefault();
    dragRect.remove();
  };
  
  function showTooltip(d) {
    var html = d.type + "<br/>"
              + "Time: " + d.time.format("HH:mi:ss") + "<br/>"
              + "Value: " + d.originValue;
    
    _properties.tooltip
      .style("display", "block")
      .style("left", d3.event.pageX + 5)
      .style("top", d3.event.pageY + 5)
      .html(html);
  }
  
  function hideTooltip() {
    _properties.tooltip
      .style("display", "none");
  }
  
  var isLoop = true;
  (function() {
    function loop() {
      if (isLoop) {
        var now = new Date();
        var compareDate = new Date(now.getTime() - (tickInterval * tickCount));
        for (var i = 0; i < chartData.length; i++) {
          if (compareDate.getTime() < chartData[i].time) {
            if (i > 0) {
              chartData.splice(0, i);
            }
            break;
          }
        }
        
        update();
      }
      
      setTimeout(loop, tickInterval);
    }
    loop();
  }());
  
  return {
    init: init
    , add: add
    , resize: resize
  }
};


var d3TreeMap = function($container, option) {
  
  var w, h, marginTop, marginBottom, marginLef, marginRight, contentsWidth, contentsHeight;
  
  function calcAndSetSize(option) {
    w = option.width, h = option.height
    , marginTop = 5, marginBottom = 5, marginLeft = 5, marginRight = 5
    , contentsWidth = w - marginLeft - marginRight, contentsHeight = h - marginTop - marginBottom
  };
  calcAndSetSize(option);
  
  var svg = d3.select($container.selector)
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  
  var chartG = svg.append("g")
    .attr("transform", "translate("+marginLeft+", "+marginTop+")");
  
//  {
//    name: "root"
//    , children: [
//      { // 타입
//        id: 0
//        , name: "message"
//        , children: [
//          { // 조직
//            id: 0
//            , name: "organization"
//            , children: [
//              { // 네트워크
//                id: 0
//                , name: "network1"
//                , children: [
//                  { // 장비
//                    id: 0
//                    , name: "device_name"
//                    , value: 100
//                  }
//                ]
//              }
//            ]
//          },
//        ]
//      },
//    ]
//  };
  
  var root = d3.hierarchy(option.data);
  root.sum(function(d) { return d.value; })
    .sort(function(a,b) { return b.height - a.height || b.value - a.value; });
  
  var treemap = d3.treemap()
    .round(true)
    .size([w, h])
    .padding(1)
    ;

  treemap(root);
  var cell = svg.selectAll(".cell")
    .data(root.leaves())
    .enter().append("g")
    .attr("class", "cell")
    .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
    ;
  
  cell.append("rect")
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .style("fill", function(d) {
      return d.data.colorClass;
    });
  
  cell.append("text")
    .attr("text-anchor", "start")
    .attr("x", 3)
    .attr("dy", 13)
    .style("font-size", 10)
    .text(function(d) { return d.data.name; })
    ;
};