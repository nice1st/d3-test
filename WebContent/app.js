/**
 * 
 */
$(function() {
  
  var colorClass = ["blue", "green", "hotpink", "blue"];
  var data = [];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var interval = 1000;
  var bCount = 200;
  var isToggle = false;
  (function() {
    function loop() {
      if (chart != undefined) {
        chart.update();
        if (isToggle) {
          add();
        }
      }
      setTimeout(loop, interval);
    }
    loop();
  }());
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var w = 900, h = 330
      , marginTop = 10, marginBottom = 20, marginLeft = 25, marginRight = 10
      , contentsWidth = w - marginLeft - marginRight, contentsHeight = h - marginTop - marginBottom;
  
  var chart;
  $("#btnStart").on("click", function() {
    isToggle = true;
  });
  $("#btnStop").on("click", function() {
    isToggle = false;
  });
  
  var add = function() {
    
    var now = new Date();
    
    for (var addCound = 0; addCound < (Math.floor(Math.random() * 6)); addCound++) {
      data.push( {date: now, value: Math.round(Math.random() * 100), colorClass: colorClass[Math.floor(Math.random() * 3)]} );
    }
    
    var compareDate = new Date(now.getTime() - (interval * bCount));
    for (var i = 0; i < data.length; i++) {
      if (compareDate.getTime() < data[i].date.getTime()) {
        if (i > 0) {
          data.splice(0, i);
        }
        break;
      }
    }
    
    if (chart != undefined) {
      console.log(data[data.length - 1]);
      console.log(data.length);
      chart.setData(data);
    }
  };
  
  var init = function() {
    
    var _this = this;
    var chartData;

    var transition = d3.transition().duration(0);
    var dragBehavior = d3.drag()
                        .on("drag", dragged)
                        .on("start", dragStarted)
                        .on("end", dragEnded);
    var selectionRect = {
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
        var rectElement = svg.append("rect")
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
      },
      removePrevious: function() {
        if(this.previousElement) {
          this.previousElement.remove();
        }
      }
    };
    
    var svg = d3.select("div#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .call(dragBehavior);
        
    var chartG = svg.append("g")
        .attr("transform", "translate("+marginLeft+", "+marginTop+")");
    
    var now = new Date();
    var xScale = d3.scaleTime()
                  .domain([new Date(now.getTime() - (interval * bCount)), now])
                  .range([0, (contentsWidth - ((contentsWidth / bCount) / 2))]);
    var yScale = d3.scaleLinear().domain([0, 100]).range([contentsHeight, 0]);
    var xAxis = d3.axisBottom().scale(xScale).ticks(d3.timeMillisecond.every((interval * bCount) / 20)).tickFormat(d3.timeFormat("%M:%S"));
    var yAxis = d3.axisLeft().scale(yScale);
    
    this.setData = function(data) {
      
      chartData = data;
    }
    
    this.update = function() {
      
      var now = new Date();
      xScale.domain([new Date(now.getTime() - (interval * bCount)), now])
            .range([0, (contentsWidth - ((contentsWidth / bCount) / 2))]);
      
      updateBar();
      updateAxis();
      
    }
    
    this.draw = function() {
      chartG.append("g")
          .attr("class", "contentContainer")
          .selectAll("circle")
          .data(chartData)
          .enter()
          .append("circle");
      
      chartG.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + contentsHeight + ")")
          .call(xAxis);
      
      chartG.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0, 0)")
          .call(yAxis);
    }
    
    var updateAxis = function() {
      chartG.select(".x.axis")
//          .transition(transition)
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + contentsHeight + ")")
          .call(xAxis);
    }
    
    var updateBar = function() {
      var circle = chartG.select("g.contentContainer").selectAll("circle").data(chartData);
      
      circle.exit().remove();
      circle.enter().append("circle").merge(circle)
//          .transition(transition)
          .attr("cx", function(d, i) {
            return xScale(new Date(d.date));
          })
          .attr("cy", function(d) {
            return yScale(d.value);
          })
          .attr("r", 4)
          .attr("fill", function(d) {
            return d.colorClass;
          });
    }
    
    function dragStarted() {
      var p = d3.mouse(this);
      selectionRect.init(p[0], p[1]);
      selectionRect.removePrevious();
    }

    function dragged() {
      var p = d3.mouse(this);
      selectionRect.update(p[0], p[1]);
    }

    function dragEnded() {
      
      // to-do
      d3.event.sourceEvent.preventDefault();
      selectionRect.remove();
    }
  }
  
  chart = new init();
  chart.setData(data);
  chart.draw();
});