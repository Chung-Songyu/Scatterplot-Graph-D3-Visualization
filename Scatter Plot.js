const req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
req.send();
req.onload = function() {
  const dataset = JSON.parse(req.responseText);

  const padding = {
    top: 60,
    bot: 100,
    left: 150,
    right: 150
  };
  const height = 800;
  const width = 1600;

  const svg = d3.select("#container")
                .append("svg")
                .attr("height", height)
                .attr("width", width);
  const tooltip = d3.select("#container")
                    .append("div")
                    .attr("id", "tooltip")
                    .attr("class", "hidden");
  const legend = d3.select("#container")
                   .append("div")
                   .attr("id", "legend")
                   .style("top", padding.top + "px")
                   .style("left", width - padding.right - 220 + "px")
                   .html("<div id='dope' class='legend-color'></div> Doping allegations <br/> <div id='no-dope' class='legend-color'></div> No doping allegations");

  const xScale = d3.scaleLinear()
                   .domain([d3.min(dataset, (d) => d.Year), d3.max(dataset, (d) => d.Year)])
                   .range([padding.left, width - padding.right])
                   .nice();

  const yParseTime = (time) => time.split(":");
  const yScale = d3.scaleTime()
                   .domain([d3.min(dataset, (d) => new Date(1994, 0, 1, 0, yParseTime(d.Time)[0], yParseTime(d.Time)[1])), d3.max(dataset, (d) => new Date(1994, 0, 1, 0, yParseTime(d.Time)[0], yParseTime(d.Time)[1]))]) //new Date() used to convert data to Date object, arbitary year/month/day given as required syntax + fulfil test requirement #6 (year should at least be 1990)
                   .range([padding.top, height - padding.bot])
                   .nice();

  const legendColor = (doping) => {
    if(doping=="") {
      return "blue";
    } else {
      return "red";
    }
  };
  svg.selectAll("circle")
     .data(dataset)
     .enter()
     .append("circle")
     .attr("cx", (d) => xScale(d.Year))
     .attr("cy", (d) => yScale(new Date(1994, 0, 1, 0, yParseTime(d.Time)[0], yParseTime(d.Time)[1])))
     .attr("r", 5)
     .style("fill", (d) => legendColor(d.Doping))
     .attr("class","dot")
     .attr("data-xvalue", (d) => d.Year)
     .attr("data-yvalue", (d) => new Date(1994, 0, 1, 0, yParseTime(d.Time)[0], yParseTime(d.Time)[1]))
     .on("mouseover", function(d, i) {
        d3.select("#tooltip").classed("hidden", false);
        const doping = i.Doping==""? "":"<br/><br/>" + i.Doping;
        tooltip.style("top", yScale(new Date(1994, 0, 1, 0, yParseTime(i.Time)[0], yParseTime(i.Time)[1])) + "px")
               .style("left", xScale(i.Year) + 15 + "px")
               .html(i.Name + " (" + i.Nationality + ")<br/>Year: " + i.Year + "<br/>Time: " + i.Time + doping)
               .attr("data-year", i.Year);
     })
     .on("mouseout", function(d, i) {
        tooltip.attr("class", "hidden");
     });

  const xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format("d"));
  svg.append("g")
      .attr("transform", "translate(0, " + (height - padding.bot) + ")")
      .attr("id", "x-axis")
      .call(xAxis);
  svg.append("text")
     .text("Year")
     .attr("id", "xAxisLabel")
     .attr("transform", "translate(" + width/2 + ", 760)");

  const yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat("%M:%S"));
  svg.append("g")
     .attr("transform", "translate(" + padding.left + ", 0)")
     .attr("id", "y-axis")
     .call(yAxis);
  svg.append("text")
     .text("Time (min)")
     .attr("id", "yAxisLabel")
     .attr("transform", "translate(60, " + height/2 + ")rotate(270)");
};