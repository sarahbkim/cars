'use strict';

/**
 * @ngdoc function
 * @name carsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the carsApp
 */

var parseYear = d3.time.format('%Y').parse,
    parseYearMonth = d3.time.format('%m-%Y').parse

angular.module('carsApp')
  .controller('MainCtrl', function($scope) {
    
    $scope.getAnswer = function(x) {
      if(x=='no') {
        $scope.wellSegue = "Lucky you! Perhaps you haven't experienced it first hand, but driving can be quite perilous!"
      } else {
        $scope.wellSegue = "You're one of many! As you well know, driving can be quite perilous!";
      }
      return $scope.wellSegue;
    }

  })
  .controller('DrivingStatsCtrl', function($scope, DataFactory) {
      
    DataFactory('data/car_stats.csv')
      .then(function(data){
        
        $scope.items = d3.csv.parse(data.data)
        $scope.items.forEach(function(d) {
          for(var i in d) {
              if(i!=='year') {
                d[i] = +d[i];
              } else {
                d[i] = parseYear(d[i]);
              }
            }
        });

        $scope.melted = melt($scope.items, ['year']);

        var ndxMelted = crossfilter($scope.melted);

        // dimensions
        var cate = ndxMelted.dimension(function(d) { return d.variable});
        var yearCate = ndxMelted.dimension(function(d) { return d.year; });

        // groups
        var accidents = yearCate.group().reduceSum(function(d) { return d.variable==='accidents' ? d.value : 0; }),
            deaths = yearCate.group().reduceSum(function(d) { return d.variable==='deaths' ? d.value: 0; }),
            non_collision_accidents = yearCate.group().reduceSum(function(d) { return d.variable==='non_collision_accidents' ? d.value: 0; }),
            collision_with_other_vehicles = yearCate.group().reduceSum(function(d) { return d.variable==='collision_with_other_vehicles' ? d.value: 0; }),
            collision_with_pede = yearCate.group().reduceSum(function(d) { return d.variable==='collision_with_pede' ? d.value: 0; }),
            collision_with_fixedobjs = yearCate.group().reduceSum(function(d) { return d.variable==='collision_with_fixedobjs' ? d.value: 0; }),
            all_vehicles = yearCate.group().reduceSum(function(d) { return d.variable==='all_vehicles' ? d.value: 0; }),
            private_commercial_vehicles = yearCate.group().reduceSum(function(d) { return d.variable==='private_commercial_vehicles' ? d.value: 0; });

        var reduceAddy = function(p, v) {
          p.deaths += v.variable ==='deaths' ? v.value : 0;
          p.accidents += v.variable ==='accidents' ? v.value : 0;
          p.deathRate = p.deaths/p.accidents;
          return p;
        }

        var reduceRemovey = function(p, v) {
          p.deaths -= v.variable ==='deaths' ? v.value : 0;
          p.accidents -= v.variable ==='accidents' ? v.value : 0;
          p.deathRate = p.deaths/p.accidents;
          return p;
        }

        var reduceInitialy = function() {
          return {
            deaths: 0,
            accidents: 0,
            deathRate: 0
          }
        };

        var rates = yearCate.group().reduce(reduceAddy, reduceRemovey, reduceInitialy);

        var reduceAdd = function(p, v) {
          p.variable = v.variable;
          p.value += v.value;
          return p;
        }
        var reduceRemove = function(p, v) {
          p.variable = v.variable;
          p.value -= v.value;
          return p;
        }
        var reduceInitial = function() {
          return {
            variable: '',
            deaths: 0,
            value: 0
          }
        }
        // cate.filter(['non_collision_accidents', 'collision_with_other_vehicles', 'collision_with_pede', 'collision_with_fixedobjs']);
        var byCate = cate.group().reduce(reduceAdd, reduceRemove, reduceInitial);

        var accidents = dc.lineChart('#accidents')
          .width(650)
          .height(300)
          .margins({top: 40, left: 40, right: 40, bottom: 40})
          .dimension(yearCate)
          .group(accidents)
          .stack(deaths)
          .renderArea(true)
          .brushOn(true)
          .round(d3.time.month.round)
          .elasticX(true)
          .elasticY(true)
          .xUnits(d3.time.months)
          .x(d3.time.scale().domain([new Date(1979, 1, 1), new Date(2010, 12, 1)]));

        var deathRates = dc.barChart('#deathRates')
          .width(650)
          .height(125)
          .margins({top: 40, left: 40, right: 40, bottom: 40})
          .dimension(yearCate)
          .group(rates)
          .valueAccessor(function(d) {
            return d.value.deathRate;
          })
          .round(d3.time.month.round)
          .elasticX(true)
          .elasticY(true)
          .brushOn(true)
          .xUnits(d3.time.months)
          .x(d3.time.scale().domain([new Date(1979, 1, 1), new Date(2010, 12, 1)]));

        var otherVehicles = dc.barChart("#otherVehicles")
          .width(650)
          .height(125)
          .margins({top: 40, left: 40, right: 40, bottom: 40})
          .dimension(yearCate)
          .group(collision_with_other_vehicles)
          .round(d3.time.month.round)
          .elasticX(true)
          .brushOn(false)
          .elasticY(true)
          .xUnits(d3.time.months)
          .x(d3.time.scale().domain([new Date(1979, 1, 1), new Date(2010, 12, 1)]));
        
        var pedes = dc.barChart("#pedes")
          .width(650)
          .height(125)
          .margins({top: 40, left: 40, right: 40, bottom: 40})
          .dimension(yearCate)
          .group(collision_with_pede)
          .round(d3.time.month.round)
          .elasticX(true)
          .brushOn(false)
          .elasticY(true)
          .xUnits(d3.time.months)
          .x(d3.time.scale().domain([new Date(1979, 1, 1), new Date(2010, 12, 1)]));
        
        var fixedObjs = dc.barChart("#fixedObjs")
          .width(650)
          .height(125)
          .margins({top: 40, left: 40, right: 40, bottom: 40})
          .dimension(yearCate)
          .group(collision_with_fixedobjs)
          .round(d3.time.month.round)
          .elasticX(true)
          .brushOn(false)
          .elasticY(true)
          .xUnits(d3.time.months)
          .x(d3.time.scale().domain([new Date(1979, 1, 1), new Date(2010, 12, 1)]));

        var collisionsByCate = dc.pieChart("#collisionsByCate")
          .width(350)
          .height(250)
          .dimension(cate)
          .group(byCate)
          .data(function(group) {
            return group.all().filter(function(kv) { 
              return kv.key != 'accidents' && kv.key != 'all_vehicles' && kv.key != 'deaths';
            });
          })
          .valueAccessor(function(d) {
            return d.value.value;
          });
    
        dc.renderAll();

      });
  })
  .controller('PerceptionsCtrl', function($scope, DataFactory) {
    DataFactory('data/perceptions.csv')
      .then(function(data) {
        $scope.items = d3.csv.parse(data.data);
        $scope.items.forEach(function(d) {
          d.year = parseYear(d.year);
          d.pct = +d.pct;
        })

        var ndx = crossfilter($scope.items),
            year = ndx.dimension(function(d) { return d.year }),
            pos = year.group().reduceSum(function(d){ return d.percept === 'pos' ? d.pct : 0 }),
            neg = year.group().reduceSum(function(d){ return d.percept === 'neg' ? d.pct : 0 });

        $scope.perceptions = dc.barChart('#perceptions')
          .width(500)
          .height(175)
          .margins({top: 40, left: 40, right: 40, bottom: 40})
          .dimension(year)
          .group(pos)
          .stack(neg)
          .x(d3.time.scale().domain([new Date(1999, 1, 1), new Date(2005, 12, 1)]))
          .round(d3.time.month.round)
          .brushOn(false)
          .xUnits(function() { return 10; });

        dc.renderAll();


      })
  })
  .controller('LegislationCtrl', function ($scope, DataFactory) {
    DataFactory('data/legislation_1.csv')
      .then(function(data) {
        $scope.items = d3.csv.parse(data.data);
        $scope.items.forEach(function(d) {
          d.Year = parseYear(d.Year);
          d.Introduced = parseYearMonth(d.Introduced);
          d.Last_Action = parseYearMonth(d.Last_Action);
        });
      })
  })
  .controller('HistoryCtrl', function($scope, DataFactory) {
    DataFactory('data/history.csv')
      .then(function(data) {
        $scope.items = d3.csv.parse(data.data);
        $scope.items.forEach(function(d) {
          d.Year = parseYear(d.Year);
        });
        
        var margins = {top: 250, right: 40, bottom: 250, left: 40},
            w = 400 - margins.left - margins.right,
            h = 2000 - margins.top - margins.bottom;

        var t1 = new Date(1970, 0, 1),
            t2 = new Date(2045, 0, 1);

        var y = d3.time.scale()
          .domain([t1, t2])
          .range([0, h]);

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('right');

        var svg = d3.select('#timeline').append('svg')
            .attr('width', w).attr('height', h).attr('class', 'dc-chart')
            .append('g')

        svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
          .selectAll('text')
            .attr('y', 6)
            .attr('x', 6)
            .style('text-anchor', 'start');

        svg.append('g')
          .attr('class', 'main')
          .selectAll('circle')
            .data($scope.items)
            .enter()
            .append('circle')
            .attr('cx', 50) 
            .attr('cy', function(d) {
              return y(d.Year);
            })
            .attr('r', 2.5);

        svg.select('.main').selectAll('text')
          .data($scope.items)
          .enter()
          .append('text')
          .text(function(d) {
            return d.Year.getFullYear() + ': ' + d.Note;
          })
          .attr('x', 60) 
          .attr('y', function(d) {
            return y(d.Year);
          });
         
      })
  });
