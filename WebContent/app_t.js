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
  var tId;
  (function loop() {
    clearTimeout(tId);
    if (test != undefined && isToggle) {
//      add();
    }
    
//    test.update();
    
    tId = setTimeout(loop, interval);
  })();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var w = 900, h = 330
      , marginTop = 10, marginBottom = 20, marginLeft = 25, marginRight = 10
      contentsWidth = w - marginLeft - marginRight, contentsHeight = h - marginTop - marginBottom;
  
  var test;
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
    
    if (test != undefined) {
      test.setData(data);
    }
  };
  
  var init = function() {
    
    var _this = this;
    var svg = d3.select("div#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded))
        .append("g")
        .attr("transform", "translate("+marginLeft+", "+marginTop+")");
    
    svg.append("rect")
        .attr("class", "dragBox")
        .attr("display", "none");
    var now = new Date();
    var xScale = d3.scaleTime()
                  .domain([new Date(now.getTime() - (interval * bCount)), now])
                  .range([0, (contentsWidth - ((contentsWidth / bCount) / 2))]);
    var yScale = d3.scaleLinear().domain([0, 100]).range([contentsHeight, 0]);
    var xAxis = d3.axisBottom().scale(xScale).ticks(d3.timeMillisecond.every((interval * bCount) / 20)).tickFormat(d3.timeFormat("%M:%S"));
    var yAxis = d3.axisLeft().scale(yScale);
    
    var chartData;
    
    this.setData = function(data) {
      
      chartData = data;
    }
    
    this.update = function() {
      
      var now = new Date();
      xScale.domain([new Date(now.getTime() - (interval * bCount)), now])
            .range([0, (contentsWidth - ((contentsWidth / bCount) / 2))]);
      
      var t = d3.transition().duration(0);
      updateBar(t);
      updateAxis(t);
      
    }
    
    this.draw = function() {
      svg.append("g")
          .attr("class", "contentContainer")
          .selectAll("circle")
          .data(chartData)
          .enter()
          .append("circle");
      
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + contentsHeight + ")")
          .call(xAxis);
      
      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0, 0)")
          .call(yAxis);
    }
    
    var updateAxis = function(t) {
      svg.select(".x.axis")
          .transition(t)
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + contentsHeight + ")")
          .call(xAxis);
    }
    
    var updateBar = function(t) {
      var circle = svg.select("g.contentContainer").selectAll("circle").data(chartData);
      
      if (circle.length) {
        
      }
      circle.exit().remove();
      
      circle.enter().append("circle").merge(circle)
          .transition(t)
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
      
      circle.exit().remove();
    }
    
    function dragStarted(d) {
      console.log(d);
    }

    function dragged(d) {
      console.log(d);
    }

    function dragEnded(d, i) {
      console.log(d, i);
    }
  }
  
  test = new init();
  test.setData(data);
  test.draw();
});