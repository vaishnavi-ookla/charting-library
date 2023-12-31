var rmBarChart = function() {
	
	'use strict';
    
    // jquery inview
    (function(e){function t(){var t=e();if(e.each(n,function(e,i){var n=i.data.selector,a=i.$element;t=t.add(n?a.find(n):a)}),t.length)for(var i=0;t.length>i;i++)if(t[i])if(e.contains(r,t[i])){var a=e(t[i]),c=a.data("inview"),l=a[0].getBoundingClientRect(),o=a.height(),h=a.width();l.top>=0-o&&l.left>=0-h&&l.bottom<=(d.innerHeight||r.clientHeight)+o&&l.right<=(d.innerWidth||r.clientWidth)+h?c||a.data("inview",!0).trigger("inview",[!0]):c&&a.data("inview",!1).trigger("inview",[!1])}else delete t[i]}var i,n={},a=document,d=window,r=a.documentElement,c=e.expando;e.event.special.inview={add:function(a){n[a.guid+"-"+this[c]]={data:a,$element:e(this)},i||e.isEmptyObject(n)||(i=setInterval(t,333))},remove:function(t){try{delete n[t.guid+"-"+this[c]]}catch(a){}e.isEmptyObject(n)&&(clearInterval(i),i=null)}}})(jQuery);
		
	var dataset,
		svg,
		height = 400,
	 	width = 600,
	 	ranks = false,
	 	ticks = 5,
		margin = {top: 40, right: 40, bottom: 60, left: 40},
		min = 0,
		max = 100,
		customMax = false,
		barWidth,
        locale,
		recWidth,
		errorBars = true,
		cwidth,
		cheight,
		y,
		yAxis,
		x,
		xAxis,
		animationComplete = false;

	
	function chart(selection) {
		cwidth = width - margin.right - margin.left;
		cheight = height - margin.top - margin.bottom;	
		
		selection.each(function(data) {									
			var div = d3.select(this),               
                $div = $(div[0]);      
                
            svg = div.selectAll('svg').data([data]);                        
               
            svg.enter().append('svg')
	                   .call(chart.svgInit);    
                                                                                
			// div.node() converts d3 selection to jquery selection for plugin use
			$div.bind('inview', function(event, isInView) {
			  if (isInView) {
			    if(!animationComplete) {
				    animationComplete = true;
				 	svg.call(chart.animate); 
			    }				  	
			  }
			});                                                			
		});
	}
	
	chart.update = function(data) {
		dataset = data;
		svg.call(chart.animate);
	}
	
	chart.animate = function(svg) {	
		barWidth = cwidth / dataset.length;
	  	recWidth = barWidth / 2;
			
		var barContent = svg.select('.bar-content');							
		var bars = barContent.selectAll('.carrier-bar').data(dataset);	
		var scores = barContent.selectAll('.scoreText').data(dataset);
		var rankText = barContent.selectAll('.rankText').data(dataset);
		var rankCircles = barContent.selectAll('.rankCircle').data(dataset);
		var errorBar = barContent.selectAll('.error-bar').data(dataset);
		var carrierText = barContent.selectAll('.carrierText').data(dataset);
		var xLines = xAxis.selectAll(".xaxis").data(dataset);		
		var upperMax = customMax ? max : d3.extent(dataset, function(d) { return +d.upper; })[1];

		y.domain([min, upperMax]);
		svg.select(".y.axis").transition().duration(500).call(yAxis);
		
		svg.select('.x.axis')
			.attr('transform', 'translate(' + [barWidth, 0] + ')');
		
		xLines.exit().remove();
		
		xLines.enter()
			.append("line")
			.attr("class", "xaxis")
			.attr("transform", function(d,i) {
				return "translate(" + ((i * barWidth) ) + ", 0)"
			})
			.attr("x1", 0)					
			.attr("x2", 0)
			.attr("y1", 0)	
			.attr("y2", cheight);	
		
		xLines.transition()
			.duration(500)
			.attr("class", "xaxis")
			.attr("transform", function(d,i) {
				return "translate(" + ((i * barWidth) ) + ", 0)"
			})
			.attr("x1", 0)					
			.attr("x2", 0)
			.attr("y1", 0)	
			.attr("y2", cheight);					
	
		bars.exit().remove();					
								
		bars.enter()
			.append('rect')
			.attr('class', function(d) {
				return 'carrier-bar';
			})
			.attr("y", cheight)
			.attr("transform", function(d, i) { return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth/2) + ",0)"; })
			.attr("height", 0);
			
		bars.transition()	
			.duration(500)
			.delay(function(d, i) { return 100 * i })
			.ease('exp-out')
			.attr('class', function(d) {
				return d.name + ' carrier-bar';
			})
			.attr("transform", function(d, i) { return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth/2) + ",0)"; })			
			.attr("height", function(d) { return cheight - y(d.score); })	
			.attr("width", recWidth)		
			.attr("y", function(d) { return y(d.score); });	
			
		
		if(errorBars) { 
			errorBar.exit().remove();
							
			errorBar.enter()
					.append("rect")
					.attr("class", function(d) { return d.name })
					.classed("error-bar secondary", true)
					.attr("width", 2)
					.attr("transform", function(d, i) { 
						return "translate(" + ((i * barWidth) + (barWidth/2)) + "," + cheight + ")"; })
					.attr("height", 0);
					
			errorBar.transition()
					.duration(500)
					.delay(function(d, i) { return 100 * i})
					.ease('exp-out')
					.attr('class', function(d) {
						return d.name + ' error-bar secondary';
					})
					.attr("transform", function(d, i) {
						var upperScale = y(d.upper);
						return "translate(" + ((i * barWidth) + (barWidth/2)) + "," + upperScale + ")"; 
					})
					.attr("height", function(d) {
						var upperScale = y(d.upper);
						var lowerScale = y(d.lower);
						return  (lowerScale - upperScale);   
					});		
		};	
		
		carrierText.exit().remove();								
		
		carrierText.enter()
	            .append("text")
	            .style("font-size", "12px")
	            .attr("class", "carrierText")
	            .style("fill", "#555555")
	            .attr("y", cheight + 20)
	            .style("text-anchor", "middle")
	            .attr("transform", function(d, i) { 
					return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; 
	            })
	            .text(function(d){
                    return d.name;
                });	
						
		carrierText
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i })
			.text(function(d){
                return d.name;
            })
			.attr("y", cheight + 20)
            .style("text-anchor", "middle")
			.attr("transform", function(d, i) { 
				return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; 
            });							
		
		scores.exit().remove();  
			
            
		scores.enter()
            .append("text")
            .attr("class", "scoreText")
            .attr("text-anchor", "middle")
            .style("fill", "#555")
            .style("font-size", "12px")
            .attr("transform", function(d, i) { 
		        return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  cheight + ")"; 
             })   
            .text(function(d) {
                return locale.numberFormat('.1f')(d.score);
            });	
			
		scores.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})
			.ease('exp-out')
			.attr("transform", function(d, i) {
				if(d.upper) {
	            	return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  (y(d.upper) - 5) + ")";
            	} else {
	            	return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  (y(d.score) - 5) + ")";
            	} 
			})             
            .text(function(d) {
                 return locale.numberFormat('.1f')(d.score);
            });
           
			
		if(ranks) {
			
			rankCircles.exit().remove();
	       
			rankCircles.enter()
                .append("circle")
                .attr('class', "rankCircle")
                .attr("fill", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "transparent";
					}
				})
				.attr("stroke", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "#999999";
					}
				})
                .attr("stroke-width", "1px")
                .attr("cy", cheight + 40)
                .attr("r", 10)
                .attr("transform", function(d, i) { return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; }) 	
 	       
	        rankCircles.attr('class', "rankCircle")
                .style("fill", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "transparent";
					}
				})
				.style("stroke", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "#999999";
					}
				})
				.transition()
				.duration(500)
				.attr("transform", function(d, i) { return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; }) 
			
			
			rankText.exit().remove();
	       
			rankText.enter()
	            .append("text")
	            .style("font-size", "12px")
	            .attr("class", "rankText")
	            .style("fill", function(d) {
					if(d.rank == 1) {
						return "#FFFFFF";
					} else {
						return "#555555";
					}
				})
	            .attr("y", cheight + 44)
	            .style("text-anchor", "middle")
	            .attr("transform", function(d, i) { 
					return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; 
	            })
	            .text(function(d, i){ return d.rank; });
			
	        rankText.transition()
				 .duration(500)
	             .attr("transform", function(d, i) { 
					return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; 
	             })
	             .style("fill", function(d) {
					if(d.rank == 1) {
						return "#FFFFFF";
					} else {
						return "#555555";
					}
				})
				.text(function(d) { return d.rank })       	             	       	       		        	        	        	        	    		             
	               
        } 
 	
			             
	};	
	
	chart.svgInit = function(svg) {
		// Set the SVG size.
        svg.attr('width', width)
           .attr('height', height);

        var g = svg.append('g')
            .attr('class', 'chart-content')
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');
		
		  	
	  	barWidth = cwidth / dataset.length;
	  	recWidth = barWidth / 2;
	  	
	  	y = d3.scale.linear().domain([min, max]).range([cheight, 0]);

		yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks(ticks)
		    .tickPadding(10)
		    .tickSize(-cwidth);	
				
			g.append("g")
		    .attr("class", "y axis")

			g.select(".y.axis").call(yAxis);
			
		
		xAxis = g.append("g")
		    .attr("class", "x axis")
		    .attr('transform', 'translate(' + [barWidth, 0] + ')');							
		
		var bars = g.append('g')
			.attr('class', 'bar-content');				                    
	}
	
	
	chart.width = function(value) {
        if (!arguments.length) { return width; }
        width = value;
        return chart;
    };

    // Height Accessor
    chart.height = function(value) {
        if (!arguments.length) { return height; }
        height = value;
        return chart;
    };

    // Margin Accessor
    chart.margin = function(value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return chart;
    };
    
    chart.min = function(value) {
	    if (!arguments.length) { return min; }
	    min = value;
	    return chart;
    }
    
    chart.max = function(value) {
	    if (!arguments.length) { return max; }
	    max = value;
	    return chart;
    }
    
    chart.customMax = function(value) {
	    if (!arguments.length) { return customMax; }
	    customMax = value;
	    return chart;
    }
    
    chart.errorBars = function(value) {
	    if (!arguments.length) { return errorBars; }
	    errorBars = value;
	    return chart;
    }
    
    chart.ranks = function(value) {
	    if (!arguments.length) { return ranks; }
	    ranks = value;
	    return chart;
    }
    
    chart.ticks = function(value) {
	    if (!arguments.length) { return ticks; }
	    ticks = value;
	    return chart;
    }
    
    chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;
    }
    
    chart.locale = function(value) {
        if (!arguments.length) { return locale;}
        locale = value;
        return chart;
    }
	
	return chart;
};