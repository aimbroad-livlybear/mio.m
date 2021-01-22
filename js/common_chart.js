
$(function(){
    am4core.addLicense("CH227933972");
    am4core.useTheme(am4themes_animated);
});

//
// Chart Utils
//
chartUtil = {
    
    color : { line        : "#bd245a"
            , point       : "#e53978"
            , pointBorder : "#e53978"
            , pointLabel  : "#e63a79"
            , axisLine    : "#989696"
            , axisLabel   : "#989696"
            , axisTitle   : "#989696"
            , gridLine    : "#787878"
            , gridLineSoft: "#acacac"
            , guide       : "#00ce7d"
            , purpleBar   : "#9a1de2"
            , purpleLabel : "#a511fa"
            }
    
  , hsecs2str : function(half, hsecs){
        var ext = 0;
        if (half=="H2") ext =  45;
        if (half=="H3") ext =  90;
        if (half=="H4") ext = 105;
        
        var min = Math.floor(hsecs / 60)+ext;
        var sec = hsecs % 60;
        
        min = lpad(min,2);
        sec = lpad(sec,2);
        
        return half+" "+min+":"+sec;
    }
    
    //
    // POPUP : RATING
    //
  , detail_rating_init : function(wid){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 0;
        chart.paddingBottom = 0;
        chart.paddingLeft   = 0;
        chart.paddingRight  = 20;
        chart.zoomOutButton.disabled = true;
        
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        //xAxis.title.text = "Round";
        xAxis.dataFields.category = "round";
        xAxis.renderer.minGridDistance = 1;
        xAxis.renderer.grid.template.location = 0;
        xAxis.renderer.line.strokeOpacity = 1;
        xAxis.renderer.line.strokeWidth = 1;
        xAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        xAxis.renderer.grid.template.stroke = am4core.color(this.color.gridLine);
        xAxis.renderer.grid.template.strokeOpacity = 0.5;
        xAxis.renderer.grid.template.strokeDasharray = "2,1";
        xAxis.renderer.labels.template.fill = am4core.color(this.color.axisLabel);
        xAxis.renderer.labels.template.fontSize = 13;
        xAxis.renderer.labels.template.adapter.add("text", function(txt) {
            return txt + "R";
        });
        xAxis.tooltip.fontSize = 13;
        xAxis.adapter.add("getTooltipText", (txt) => {
            return txt + "R";
        });
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "AI Rating";
        yAxis.title.fill = am4core.color(this.color.axisTitle);
        yAxis.title.marginRight = 5;
        yAxis.title.fontSize = 13;
        yAxis.renderer.minGridDistance = 0.01;
        yAxis.renderer.line.strokeOpacity = 1;
        yAxis.renderer.line.strokeWidth = 1;
        yAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.labels.template.disabled = true;
        yAxis.tooltip.fontSize = 13;
        yAxis.cursorTooltipEnabled = false;
        
        var series = chart.series.push(new am4charts.LineSeries());
        series.name = "Ratings";
        series.dataFields.valueY = "rating";
        series.dataFields.categoryX = "round";
        series.tensionX = 0.8;
        series.stroke = am4core.color(this.color.line);
        series.strokeWidth = 1;
        series.tooltipText = "{round}R [bold]{rating}[/]";
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = am4core.color(this.color.point);
        series.tooltip.label.fill = am4core.color("#fff");
        series.tooltip.label.fontSize = 13;

        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.radius = 4;
        bullet.circle.strokeWidth =0;
        bullet.circle.fill = am4core.color(this.color.point);

        var label = series.bullets.push(new am4charts.LabelBullet());
        label.label.text = "{rating}";
        label.label.fontSize = 14;
        label.label.fontWeight = "400";
        label.label.fill = am4core.color(this.color.pointLabel);
        label.label.dy = -12;
        label.label.truncate = false;
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = series;
        cursor.xAxis = xAxis;
        cursor.lineY.disabled = true;
        cursor.behavior = "panX"; // zoomX,zoomY,zoomXY,panX,panY,panXY
        cursor.maxPanOut = 0.1;
        
        // 6개 이상일때 Zoom & Pan
        chart.events.on("datavalidated", function () {
            var len = chart.data.length;
            if (len > 6){
                xAxis.zoomToCategories(chart.data[len-6].round, chart.data[len-1].round);
            }else if (len > 0){
                xAxis.zoomToCategories(chart.data[0].round, chart.data[len-1].round);
            }
        });
        
        return chart;
    }
    
  , detail_rating_load : function(chart, matches=[], avg=0, column='gi_score'){
    
        var _data  = [];
        var len    = matches.length;
        var minVal = parseFloat(avg);
        var maxVal = parseFloat(avg);
        var xAxis  = chart.xAxes.values[0];
        var yAxis  = chart.yAxes.values[0];

        for (var i = matches.length-1; i >= 0; i--){ // 목록이 Round 역순으로 저장되어 있음
            var el = matches[i];
            var r = el.gm_round;
            
            if (el.hasOwnProperty(column) === false) return false;
            var s = el[column];
            
            var rating = parseFloat(s).toFixed(1);
            // 선수들의 평점은 소수점 2자리 까지 (0.XX)
            if (column === 'gp_score') {
                rating = parseFloat(s).toFixed(2);
            }
            
            _data.push({
                "round" : r,
                "rating": rating
            });
            
            if (minVal > s) minVal = parseFloat(s);
            if (maxVal < s) maxVal = parseFloat(s);
        }
        yAxis.min = minVal - (maxVal - minVal)*0.1;
        yAxis.max = maxVal + (maxVal - minVal)*0.2;
        
        chart.data = _data;
        
        // Average line
        yAxis.axisRanges.clear();
        if (avg > 0){
            var range = yAxis.axisRanges.create();
            range.value = avg;
            range.grid.stroke = am4core.color(this.color.guide);
            range.grid.strokeWidth = 1;
            range.grid.strokeOpacity = 1;
            range.grid.strokeDasharray = "4,2"
            range.label.text = "EPL AVG " + parseFloat(avg).toFixed(2);
            range.label.inside = true;
            range.label.rotation = 90;
            range.label.fontWeight = "normal";
            range.label.fontSize = 12;
            range.label.fill = range.grid.stroke;
            range.label.align = "right";
            range.label.dx = 8
            range.label.horizontalCenter = "middle";
        }
    }
    
  , detail_rating_reset : function(wid, matches=[], avg=0){
        
        var ratings = new Array();
        var labels  = new Array();
        var len     = matches.length;
        var minVal  = parseFloat(avg);
        var maxVal  = parseFloat(avg);
        
        ratings.push("rating");
        
        matches.forEach(function(el, idx, arr){
            var r = el.gm_round;
            var s = (typeof el.gi_score != 'undifined') ? el.gi_score : el.gp_score;
            labels.push(r+"R");
            ratings.push(parseFloat(s).toFixed(2));
             if (minVal > s) minVal = parseFloat(s);
             if (maxVal < s) maxVal = parseFloat(s);
        });
        
        var chart = bb.generate({
            bindto  : "#"+wid
          , padding : { top:0, bottom:0, left:20, right:20 }
          , zoom    : { enabled: false }
          , data    : { type   : "spline"
                      , columns: [ ratings ]
                      , colors : { rating  : "#bd245a" }
                      , labels : { colors  : { rating: "#e63a79" }
                                 , position: { rating: { x: 0, y: -5 } }
                                 }
                      }
          , axis    : { y: { tick : { show : false, text: { show : false } }
                           , label: { text: "AI Rating", position: "outer-middle" }
                           , min  : minVal // - (maxVal - minVal)*0.1
                           , max  : maxVal // + (maxVal - minVal)*0.1
                           }
                      , x: { type: "category"
                           , tick: { show : false, text: { show : true } }
                           , categories: labels
                           }
                      }
          , point   : { r:5, select:{r:10}, focus:{r:10} }
          , grid    : { x: { show : false  }
                      , y: { show : false 
                           , lines: [ { value: avg, text: "EPL AVG "+parseFloat(avg).toFixed(2), position: "end" } ]
                           } 
                      }
          , legend  : { show: false }
          , tooltip : { show: false }
        });
        
        if (len > 6){
            chart.zoom.enable(true);
            chart.zoom([len-6,len]);
        }
        
        return chart;
    }
    
    //
    // POPUP : 최근 6경기
    //
  , detail_matches_init : function(wid){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 20;
        chart.paddingBottom = 0;
        chart.paddingLeft   = 0;
        chart.paddingRight  = 20;
        chart.maxZoomLevel  = 1;
        chart.seriesContainer.draggable = false;
        chart.seriesContainer.resizable = false;
        chart.zoomOutButton.disabled = true;
        
        var xAxis = chart.xAxes.push(new am4charts.ValueAxis());
        xAxis.title.text = "TAP";
        xAxis.title.fill = am4core.color(this.color.axisTitle);
        xAxis.title.marginTop = 5;
        xAxis.title.fontSize = 13;
        xAxis.renderer.minGridDistance = 0.1;
        xAxis.renderer.line.strokeOpacity = 1;
        xAxis.renderer.line.strokeWidth = 1;
        xAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.labels.template.disabled = true;
        xAxis.tooltip.fontSize = 13;
        xAxis.cursorTooltipEnabled = false;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "CTP";
        yAxis.title.fill = am4core.color(this.color.axisTitle);
        yAxis.title.marginRight = 5;
        yAxis.title.fontSize = 13;
        yAxis.renderer.minGridDistance = 0.01;
        yAxis.renderer.line.strokeOpacity = 1;
        yAxis.renderer.line.strokeWidth = 1;
        yAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.labels.template.disabled = true;
        yAxis.tooltip.fontSize = 13;
        yAxis.cursorTooltipEnabled = false;
        
        var series = chart.series.push(new am4charts.LineSeries());
        series.name = "matches";
        series.dataFields.valueX = "x";
        series.dataFields.valueY = "y";
        series.stroke = am4core.color(this.color.line);
        series.strokeWidth = 1;
        series.tooltipText = "{round}R : TAP [bold]{x}[/], CTP [bold]{y}[/]";
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = am4core.color(this.color.point);
        series.tooltip.label.fill = am4core.color("#fff");
        series.tooltip.label.fontSize = 13;

        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.radius = 16;
        bullet.circle.strokeWidth =0;
        bullet.circle.fill = am4core.color(this.color.point);

        var label = series.bullets.push(new am4charts.LabelBullet());
        label.label.text = "{round}";
        label.label.fontSize = 15;
        label.label.fontWeight = "400";
        label.label.fill = am4core.color("#fff");
        label.label.dy = 0;
        label.label.truncate = false;
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = series;
        cursor.xAxis = xAxis;
        cursor.lineX.disabled = true;
        cursor.lineY.disabled = true;
        cursor.behavior = "none"; // none,zoomX,zoomY,zoomXY,panX,panY,panXY
        
        return chart;
    }
    
  , detail_matches_load : function(chart, matches=[], avg_x=0, avg_y=0, column_x='gi_tap', column_y='gi_ctp'){
    
        var _data = [];
        var len   = matches.length;
        var min_x = parseFloat(avg_x);
        var max_x = parseFloat(avg_x);
        var min_y = parseFloat(avg_y);
        var max_y = parseFloat(avg_y);
        var xAxis = chart.xAxes.values[0];
        var yAxis = chart.yAxes.values[0];

        matches.forEach(function(el, idx, arr){
            var r = el.gm_round;
            
            // x 축
            if (el.hasOwnProperty(column_x) === false) return false;
            var x = el[column_x];
            
            // y 축
            if (el.hasOwnProperty(column_y) === false) return false;            
            var y = el[column_y];
            
//            var x = (typeof el.gi_tap != 'undifined') ? el.gi_tap : el.gp_tap;
//            var y = (typeof el.gi_ctp != 'undifined') ? el.gi_ctp : el.gp_ctp;
            
            _data.push({ "round":r, "x":x , "y":y });
             if (min_x > x) min_x = parseFloat(x);
             if (max_x < x) max_x = parseFloat(x);
             if (min_y > y) min_y = parseFloat(y);
             if (max_y < y) max_y = parseFloat(y);
        });
        xAxis.min = min_x - (max_x - min_x)*0.1;
        xAxis.max = max_x + (max_x - min_x)*0.1;
        yAxis.min = min_y - (max_y - min_y)*0.15;
        yAxis.max = max_y + (max_y - min_y)*0.15;
        
        chart.data = _data;
        
        // Average line Y
        yAxis.axisRanges.clear();
        var range_y = yAxis.axisRanges.create();
        range_y.value = avg_y;
        range_y.grid.stroke = am4core.color(this.color.guide);
        range_y.grid.strokeWidth = 1;
        range_y.grid.strokeOpacity = 1;
        range_y.grid.strokeDasharray = "4,2"
        range_y.label.text = "EPL AVG " + parseFloat(avg_y).toFixed(2);
        range_y.label.inside = true;
        range_y.label.rotation = 90;
        range_y.label.fontWeight = "normal";
        range_y.label.fontSize = 12;
        range_y.label.fill = range_y.grid.stroke;
        range_y.label.align = "right";
        range_y.label.dx = 8
        range_y.label.horizontalCenter = "middle";
        
        // Average line X
        xAxis.axisRanges.clear();
        var range_x = xAxis.axisRanges.create();
        range_x.value = avg_x;
        range_x.axisFill.fillOpacity = 0;
        range_x.grid.stroke = am4core.color(this.color.guide);
        range_x.grid.strokeWidth = 1;
        range_x.grid.strokeOpacity = 1;
        range_x.grid.strokeDasharray = "4,2"
        range_x.label.text = "EPL AVG " + parseFloat(avg_x).toFixed(2);;
        range_x.label.inside = true;
        range_x.label.fontWeight = "normal";
        range_x.label.fontSize = 12;
        range_x.label.fill = range_x.grid.stroke;
        range_x.label.valign = "top";
        range_x.label.dy = -27;
        range_x.label.horizontalCenter = "middle";
    }
    
    //
    // POPUP : 시즌평균 (TAP,TTP,CTP,Shoot,ASR,SSR)
    //
  , detail_average_init : function(wid){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 0;
        chart.paddingBottom = 0;
        chart.paddingLeft   = 0;
        chart.paddingRight  = 0;
        chart.maxZoomLevel  = 1;
        chart.seriesContainer.draggable = false;
        chart.seriesContainer.resizable = false;
        chart.zoomOutButton.disabled = true;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "top";
        chart.legend.align = "left";
        chart.legend.contentAlign = "left";
        chart.legend.margin(0,0,0,0);
        chart.legend.padding(0,0,0,0);
        chart.legend.labels.template.maxWidth = undefined;
        //chart.legend.markers.template.disabled = true;
        chart.legend.labels.template.text = "[{color}]{name}[/]";
        chart.legend.labels.template.fill = am4core.color(this.color.guide);
        chart.legend.labels.template.fontSize = 12;
        chart.legend.itemContainers.template.togglable = false;
        
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = "cate";
        xAxis.renderer.minGridDistance = 1;
        xAxis.renderer.line.strokeOpacity = 1;
        xAxis.renderer.line.strokeWidth = 1;
        xAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.labels.template.fill = am4core.color(this.color.axisLabel);
        xAxis.renderer.labels.template.fontSize = 13;
        xAxis.tooltip.fontSize = 13;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.renderer.minGridDistance = 0.01;
        yAxis.renderer.line.strokeWidth = 0;
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.labels.template.disabled = true;
        yAxis.cursorTooltipEnabled = false;
        
        var series_rat = chart.series.push(new am4charts.ColumnSeries());
        series_rat.name = "Team Average";
        series_rat.dataFields.valueY = "rat";
        series_rat.dataFields.categoryX = "cate";
        series_rat.fill = am4core.color(this.color.point);
        series_rat.stroke = am4core.color(this.color.point);
        series_rat.tooltipText = "{cate}: [bold]{val}[/]{unit}";
        series_rat.tooltip.getFillFromObject = false;
        series_rat.tooltip.background.fill = am4core.color(this.color.point);
        series_rat.tooltip.label.fill = am4core.color("#fff");
        series_rat.tooltip.label.fontSize = 13;
        series_rat.columns.template.width = 13;
        series_rat.columns.template.strokeOpacity = 0;
        series_rat.hiddenInLegend = true;
        
        var series_avg = chart.series.push(new am4charts.LineSeries());
        series_avg.name = "EPL Average";
        series_avg.dataFields.valueY = "bas";
        series_avg.dataFields.categoryX = "cate";
        series_avg.stroke = am4core.color(this.color.guide);
        series_avg.strokeWidth = 1;
        series_avg.tooltipText = "AVG: [bold]{avg}[/]{unit}";
        series_avg.tooltip.getFillFromObject = false;
        series_avg.tooltip.background.fill = am4core.color(this.color.guide);
        series_avg.tooltip.label.fill = am4core.color("#fff");
        series_avg.tooltip.label.fontSize = 13;

        var bullet_avg = series_avg.bullets.push(new am4charts.CircleBullet());
        bullet_avg.circle.radius =3;
        bullet_avg.circle.strokeWidth =0;
        bullet_avg.circle.fill = am4core.color(this.color.guide);

        var label_rat = series_rat.bullets.push(new am4charts.LabelBullet());
        label_rat.label.text = "{val}{unit}";
        label_rat.label.fontSize = 14;
        label_rat.label.fontWeight = "400";
        label_rat.label.fill = am4core.color(this.color.pointLabel);
        label_rat.label.dy = -12;
        label_rat.label.truncate = false;
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = series_rat;
        cursor.xAxis = xAxis;
        //cursor.lineX.disabled = true;
        cursor.lineY.disabled = true;
        cursor.behavior = "none"; // none,zoomX,zoomY,zoomXY,panX,panY,panXY
        
        return chart;
    }
    
  , detail_average_load : function(chart, _data){
    
        var min_y = 0;
        var max_y = 100;
        var xAxis = chart.xAxes.values[0];
        var yAxis = chart.yAxes.values[0];
        
        for(var idx in _data){
            var itm = _data[idx];
            _data[idx].val = parseFloat(itm.val).toFixed(1);
            _data[idx].avg = parseFloat(itm.avg).toFixed(1);
            if (min_y > _data[idx].rat) min_y = _data[idx].rat;
            if (max_y < _data[idx].rat) max_y = _data[idx].rat;
            if (min_y > _data[idx].bas) min_y = _data[idx].bas;
            if (max_y < _data[idx].bas) max_y = _data[idx].bas;
        }
        yAxis.min = min_y - (max_y - min_y)*0;
        yAxis.max = max_y + (max_y - min_y)*0.15;
        
        chart.data = _data;
    }
    
    //
    // POPUP : 공격포인트 (CTB,CTM,CTA,CTS)
    //
  , detail_paths_init : function(wid){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 0;
        chart.paddingBottom = 0;
        chart.paddingLeft   = 0;
        chart.paddingRight  = 0;
        chart.maxZoomLevel  = 1;
        chart.seriesContainer.draggable = false;
        chart.seriesContainer.resizable = false;
        chart.zoomOutButton.disabled = true;
        
        var yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        yAxis.dataFields.category = "cate";
        yAxis.renderer.minGridDistance = 1;
        yAxis.renderer.inversed = true;
        yAxis.renderer.line.strokeOpacity = 1;
        yAxis.renderer.line.strokeWidth = 1;
        yAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.labels.template.fill = am4core.color(this.color.axisLabel);
        yAxis.renderer.labels.template.fontSize = 13;
        yAxis.tooltip.fontSize = 13;
        
        var xAxis = chart.xAxes.push(new am4charts.ValueAxis());
        xAxis.renderer.minGridDistance = 0.01;
        xAxis.renderer.line.strokeWidth = 0;
        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.labels.template.disabled = true;
        xAxis.cursorTooltipEnabled = false;
        
        var series_rat = chart.series.push(new am4charts.ColumnSeries());
        series_rat.name = "Team Average";
        series_rat.dataFields.valueX = "rat";
        series_rat.dataFields.categoryY = "cate";
        series_rat.fill = am4core.color(this.color.purpleBar);
        series_rat.stroke = am4core.color(this.color.purpleBar);
        series_rat.tooltipText = "{cate}: [bold]{val}[/]{unit}";
        series_rat.tooltip.getFillFromObject = false;
        series_rat.tooltip.background.fill = am4core.color(this.color.purpleBar);
        series_rat.tooltip.label.fill = am4core.color("#fff");
        series_rat.tooltip.label.fontSize = 13;
        series_rat.columns.template.height = 17;
        //series_rat.columns.template.height = am4core.percent(100);
        series_rat.columns.template.strokeOpacity = 0;
        series_rat.hiddenInLegend = true;
        series_rat.stacked = true;
        
        var series_spc = chart.series.push(new am4charts.ColumnSeries());
        series_spc.name = "Place Holder";
        series_spc.dataFields.valueX = "hold";
        series_spc.dataFields.categoryY = "cate";
        series_spc.fill = am4core.color("#38383f");
        series_spc.stroke = am4core.color("#38383f");
        series_spc.columns.template.height = 13;
        series_spc.columns.template.height = 17;
        series_spc.columns.template.strokeOpacity = 0;
        series_spc.hiddenInLegend = true;
        series_spc.stacked = true;
        
        var series_avg = chart.series.push(new am4charts.LineSeries());
        series_avg.name = "EPL Average";
        series_avg.dataFields.valueX = "bas";
        series_avg.dataFields.categoryY = "cate";
        series_avg.stroke = am4core.color(this.color.guide);
        series_avg.strokeWidth = 1;
        series_avg.tooltipText = "AVG: [bold]{avg}[/]{unit}";
        series_avg.tooltip.getFillFromObject = false;
        series_avg.tooltip.background.fill = am4core.color(this.color.guide);
        series_avg.tooltip.label.fill = am4core.color("#fff");
        series_avg.tooltip.label.fontSize = 13;

        var bullet_avg = series_avg.bullets.push(new am4charts.CircleBullet());
        bullet_avg.circle.radius =3;
        bullet_avg.circle.strokeWidth =0;
        bullet_avg.circle.fill = am4core.color(this.color.guide);

        var label_rat = series_rat.bullets.push(new am4charts.LabelBullet());
        label_rat.label.text = "{val}{unit}";
        label_rat.label.fontSize = 14;
        label_rat.label.fontWeight = "400";
        label_rat.label.horizontalCenter = "left";
        label_rat.label.fill = am4core.color(this.color.purpleLabel);
        label_rat.label.dx = 3;
        label_rat.label.truncate = false;
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = series_rat;
        cursor.xAxis = yAxis;
        cursor.lineX.disabled = true;
        //cursor.lineY.disabled = true;
        cursor.behavior = "none"; // none,zoomX,zoomY,zoomXY,panX,panY,panXY
        
        return chart;
    }
    
  , detail_paths_load : function(chart, _data){
    
        var min_y = 0;
        var max_y = 100;
        var xAxis = chart.xAxes.values[0];
        var yAxis = chart.yAxes.values[0];
        
        for(var idx in _data){
            var itm = _data[idx];
            _data[idx].val = parseFloat(itm.val).toFixed(1);
            _data[idx].avg = parseFloat(itm.avg).toFixed(1);
            
            if (min_y > _data[idx].rat) min_y = _data[idx].rat;
            if (max_y < _data[idx].rat) max_y = _data[idx].rat;
            if (min_y > _data[idx].bas) min_y = _data[idx].bas;
            if (max_y < _data[idx].bas) max_y = _data[idx].bas;
        }
        for(var idx in _data){
            var itm = _data[idx];
            _data[idx].hold = (max_y + ((max_y - min_y)*0.15)) - itm.rat;
        }
        //xAxis.min = min_y - (max_y - min_y)*0;
        //xAxis.max = max_y + (max_y - min_y)*0.1;
        
        chart.data = _data;
    }
    
    //
    // POPUP : 경기장 공격루트 표시
    //
  , match_ground_init : function(wid){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 10;
        chart.paddingBottom = 10;
        chart.paddingLeft   = 10;
        chart.paddingRight  = 10;
        chart.seriesContainer.draggable = false;
        chart.seriesContainer.resizable = false;
        chart.zoomOutButton.disabled = true;
        chart.maskBullets   = false; // ??
        
        var xAxis = chart.xAxes.push(new am4charts.ValueAxis());
        xAxis.title.disabled = true;
        xAxis.renderer.minGridDistance = 1;
        xAxis.renderer.line.strokeWidth = 0;
        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.labels.template.disabled = true;
        xAxis.tooltip.fontSize = 13;
        xAxis.cursorTooltipEnabled = false;
        xAxis.max = 971;// + 10;
        xAxis.min =   0;// - 10;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.disabled = true;
        yAxis.renderer.minGridDistance = 1;
        yAxis.renderer.line.strokeWidth = 0;
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.labels.template.disabled = true;
        yAxis.tooltip.fontSize = 13;
        yAxis.cursorTooltipEnabled = false;
        yAxis.max =    0;// + 10;
        yAxis.min = -634;// - 10;

        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "y";
        series.dataFields.valueX = "x";
        series.strokeOpacity = 1;
        series.strokeWidth = 1;
        series.propertyFields.strokeOpacity = "line_opacity";
        series.propertyFields.strokeDasharray = "line_dash";
        series.propertyFields.stroke = "line_stroke";
        series.name = "";
        series.tooltipText = "{value}";
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.propertyFields.fill = "bullet_bg";
        series.tooltip.label.fill = am4core.color("#fff");
        series.tooltip.label.fontSize = 13;

        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.radius = 4;
        bullet.circle.strokeOpacity = 1;
        bullet.circle.strokeWidth = 1;
        //bullet.circle.stroke = am4core.color("{bullet_border}");
        bullet.circle.nonScalingStroke = true;
        bullet.circle.tooltipText = "{value}";
        //bullet.circle.fill = am4core.color("{bullet_bg}");
        bullet.circle.filters.push(new am4core.DropShadowFilter());
        bullet.circle.propertyFields.stroke = "bullet_border";
        bullet.circle.propertyFields.fill = "bullet_bg";
        bullet.circle.propertyFields.radius = "radius";

        var image = bullet.createChild(am4core.Image);
        image.width  = 14;
        image.height = 14;
        image.horizontalCenter = "middle";
        image.verticalCenter = "middle";
        image.propertyFields.href = "bullet";

        var label = series.bullets.push(new am4charts.LabelBullet());
        label.label.text = "{value}";
        label.label.fontSize = 11;
        label.label.fontWeight = "normal";
      //label.label.fill = am4core.color("{label_fill}");
        label.label.dy = -5;
        label.label.verticalCenter = "bottom";
        label.label.propertyFields.fill = "label_fill";

        var label2 = series.bullets.push(new am4charts.LabelBullet());
        label2.label.text = "{bullet_text}";
        label2.label.fontSize = 11;
        label2.label.fontWeight = "normal";
        label2.label.dy = 1;
        label2.label.fill = am4core.color("#fff");

        var label3 = series.bullets.push(new am4charts.LabelBullet());
        label3.label.text = "{act}";
        label3.label.fontSize = 11;
        label3.label.fontWeight = "bold";
        label3.label.fill = am4core.color("#fff");
        label3.label.dy = 25;
        label3.label.verticalCenter = "bottom";
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = series;
        cursor.xAxis = xAxis;
        cursor.lineX.disabled = true;
        cursor.lineY.disabled = true;
        cursor.behavior = "none"; // none,zoomX,zoomY,zoomXY,panX,panY,panXY
        
        return chart;
    }
    
    //
    // 경기상세 공격루트 UI 업데이트
    //
  , match_ground_update : function(chart, gpost_id, path_items, pid=''){
        var listData = new Array();
        var shootData = [];
        var lastPlayer = '';
        
        var mio_red        ="#D0021B";
        var mio_green      ="#00FF87";
        var mio_blue       ="#4990E2";
        var mio_black      ="#212026";
        var mio_white      ="#ffffff";
        var mio_bg         ="15181B";
        var mio_plain      ="#00f";
        var mio_pink       ="#E63A79";
        var mio_purple     ="#8B3AE8";
        var mio_spot       ="#F8E81C";
        var mio_gray       ="#434056";
        var mio_light_gray ="#999999";
        
        path_items.forEach(function(el){
            
            console.log(el.gt_id+" / "+el.gr_time+" / "+el.gr_act_code+" / "+el.gr_res_code);//+" / "+px+" / "+el.gr_res_code + " / "+px+" / "+py);
            
            var pname   = '';
            var tooltip = '';
            if (lastPlayer == el.p_name_en){
                tooltip = pname = el.p_name_en;// + " Dribble";
            }else{
                tooltip = pname = lastPlayer  = el.p_name_en;
            }
            
            var is_shoot = el.gr_act_code && (el.gr_act_code=="S" || el.gr_act_code=="H" || el.gr_act_code=="R");
            
            if (pid){
                listData.push({
                    "x"               : (parseInt(el.gr_pos_x) + 22)
                  , "y"               : (parseInt(el.gr_pos_y) + 22) * -1
                  , "value"           :  el.p_name_en //(lastPlayer != el.p_name_en) ? (lastPlayer = el.p_name_en) : ''
                  , "tooltip"         :  tooltip
                  , "line_dash"       : (el.gr_act_code == "C") ? "3,3" : ""
                  , "line_stroke"     : (el.p_id == pid || is_shoot) ? mio_red : mio_light_gray
                  , "bullet_bg"       :  is_shoot ? mio_red : ((el.p_id == pid) ? mio_pink  : (el.gr_act_code ? mio_gray : mio_gray))
                  , "bullet_border"   : (el.p_id == pid) ? mio_white : (el.gr_act_code ? (is_shoot ? mio_white : mio_bg  ) : mio_gray)
                  , "label_fill"      : (el.p_id == pid) ? mio_white : mio_light_gray
                  , "bullet_text"     :  el.gr_act_code ? "" : el.gr_res_code
                  , "radius"          :  el.gr_act_code ? 5 : 7
                  , "act"             : (el.gr_act_code == "R") ? ((el.gr_area_code == "2") ? "Penalty Kick" : "Free Kick") : ""
                });
            }else{
                listData.push({
                    "x"             : (parseInt(el.gr_pos_x) + 22)
                  , "y"             : (parseInt(el.gr_pos_y) + 22) * -1
                  , "value"         :  el.p_name_en
                  , "tooltip"       :  tooltip
                  , "line_dash"     : (el.gr_act_code == "C") ? "3,3" : ""
                  , "line_stroke"   : el.is_prev ? mio_light_gray : (is_shoot ? mio_red : mio_white)
                  , "line_opacity"  : el.gr_act_code ? 1 : 0
                  , "bullet_bg"     : el.is_prev ? mio_gray : (is_shoot ? mio_red : (el.gr_act_code ? ((el.gi_write_code=="H") ? mio_pink : mio_blue) : mio_gray))
                  , "bullet_border" : el.is_prev ? mio_bg : (el.gr_act_code ? mio_white : mio_gray)
                  , "label_fill"    : el.is_prev ? mio_light_gray :  mio_white
                  , "bullet_text"   : el.gr_act_code ? "" : el.gr_res_code
                  , "radius"        : el.gr_act_code ? 5 : 7 //6 : 7
                  , "act"           : (el.gr_act_code == "R") ? ((el.gr_area_code == "2") ? "Penalty Kick" : "Free Kick") : ""
                });
            }
            
            if (is_shoot){
                
                // 상대편 Block 이면 건너뛴다
                if (el.gr_shoot_pos_x == 0 && el.gr_shoot_pos_y == 0 &&
                    el.gr_res_code != "HX" && el.gr_res_code != "LX" && el.gr_res_code != "RX"){
                        //$dsc.css("color","red").text("DEFENSE");
                    return true;
                }
                    
                // 마지막 Shoot Point 생성
                var cx = 971;
                var cy = 634;
                var px =   0;
                var py = (cy / 2) * -1;

                if      (el.gi_part == "L") px = (el.gr_half=="H1" || el.gr_half=="H3") ? cx : 12;
                else if (el.gi_part == "R") px = (el.gr_half=="H1" || el.gr_half=="H3") ? 12 : cx;

                listData.push({
                    "x"             : px
                  , "y"             : py
                  , "label_fill"    : mio_white
                  , "line_stroke"   : mio_red
                  , "line_opacity"  : 1
                  , "bullet_bg"     : mio_red
                  , "bullet_border" : mio_red
                  , "bullet"        : (el.gr_res_code == "G") ? "/img/ico/ico-ball01.png?ver=01":""
                  , "bullet_text"   : (el.gr_res_code == "G") ? "" : el.gr_res_code.substr(0,1)
                  , "radius"        : (el.gr_res_code == "G") ? 6 : 6 // 6 : 7
                });
                
                // 골대 영역 렌더링
                var px = Math.round(parseFloat(el.gr_shoot_rate_x) * 100);
                var py = Math.round(parseFloat(el.gr_shoot_rate_y) * 100);
                
                if (el.gr_res_code == "HX") { px =  50; py = -30;}
                if (el.gr_res_code == "LX") { px = -25; py =  50;}
                if (el.gr_res_code == "RX") { px = 120; py =  50;}
                
                if (px > 0 || py > 0){
                    $("#"+gpost_id+".off").removeClass("off");
                    $("#"+gpost_id+" .ball").animate({ "left":px+"%", "top":py+"%" }, 500);
                }else{
                    $("#"+gpost_id).addClass("off");
                }
            }else{
                $("#"+gpost_id).addClass("off");
            }
        });
        chart.data = listData;
    }
    
    //
    // TIMELINE
    //
  , timeline_init : function(wid, strong=null){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align  = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 0;
        chart.paddingBottom = 0;
        chart.paddingLeft   = 0;
        chart.paddingRight  = 0;
        chart.zoomOutButton.disabled = true;
        //chart.background.fill = '#2c2f32';
        //chart.background.opacity = 0.5;
        
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = "time";
        xAxis.renderer.minGridDistance = 20;
        xAxis.renderer.grid.template.location = -0.5;
        xAxis.renderer.line.strokeOpacity = 1;
        xAxis.renderer.line.strokeWidth = 1;
        xAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        xAxis.renderer.baseGrid.disabled = true;
        xAxis.renderer.grid.template.stroke = am4core.color(this.color.gridLineSoft);
        xAxis.renderer.grid.template.strokeOpacity = 0.5;
        xAxis.renderer.grid.template.strokeDasharray = "2,1";
        xAxis.renderer.labels.template.fill = am4core.color(this.color.axisLabel);
        xAxis.renderer.labels.template.fontSize = 11;
        xAxis.tooltip.fontSize = 11;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.renderer.minGridDistance = 20;
        yAxis.renderer.line.strokeOpacity = 1;
        yAxis.renderer.line.strokeWidth = 1;
        yAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        yAxis.renderer.baseGrid.disabled = true;
        yAxis.renderer.grid.template.stroke = am4core.color(this.color.gridLineSoft);
        yAxis.renderer.grid.template.strokeOpacity = 0.5;
        yAxis.renderer.grid.template.strokeDasharray = "2,1";
        yAxis.renderer.labels.template.disabled = true;
        yAxis.cursorTooltipEnabled = false;
        
        // Create series
        var seriesHome = chart.series.push(new am4charts.LineSeries());
        seriesHome.dataFields.valueY = "value1";
        seriesHome.dataFields.categoryX = "time";
        seriesHome.strokeOpacity = 1;
        seriesHome.stroke = (strong=='A') ? am4core.color("#fff") : am4core.color("#d21f5e");
        seriesHome.name = "";
        seriesHome.tensionX = 0.8;
        seriesHome.strokeWidth = (strong=='A') ? 0.5 : 2;
      //seriesHome.tooltipText = "TAP : {value1}";
        seriesHome.tooltip.getFillFromObject = false;
        seriesHome.tooltip.background.fill = (strong=='A') ? am4core.color("#fff") : am4core.color("#d21f5e");
        seriesHome.tooltip.background.stroke = (strong=='A') ? am4core.color("#000") : am4core.color("#fff");
        seriesHome.tooltip.label.fill = (strong=='A') ? am4core.color("#000") : am4core.color("#fff");
        seriesHome.tooltip.label.fontSize = 13;
        seriesHome.adapter.add('tooltipText', (text, target/* LineSeriesDataItem*/) => {
            var data = target.tooltipDataItem.dataContext;
            if (typeof data == 'undefined')
                return "";
            var val  = data.tooltip1
            var ret  = "";
            if (val){
                var arr = val.split(',');
                for (var i in arr) {
                    var tx = arr[i];
                    var ar = tx.split('|');
                    if (ret)
                        ret += "\n";
                    ret += chartUtil.hsecs2str(ar[0], ar[1]) + " " + ar[2];
                    
                }
            }
            return ret;
        });

        var seriesAway = chart.series.push(new am4charts.LineSeries());
        seriesAway.dataFields.valueY = "value2";
        seriesAway.dataFields.categoryX = "time";
        seriesAway.strokeOpacity = 1;
        seriesAway.stroke = (strong=='H') ? am4core.color("#fff") : am4core.color("#8e25cb");
        seriesAway.name = "";
        seriesAway.tensionX = 0.8;
        seriesAway.strokeWidth = (strong=='H') ? 0.5 : 2;
        seriesAway.tooltipText = "TAP : {value2}";
        seriesAway.tooltip.getFillFromObject = false;
        seriesAway.tooltip.background.fill = (strong=='H') ? am4core.color("#fff") : am4core.color("#8e25cb");
        seriesAway.tooltip.background.stroke = (strong=='H') ? am4core.color("#000") : am4core.color("#fff");
        seriesAway.tooltip.label.fill = (strong=='H') ? am4core.color("#000") : am4core.color("#fff");
        seriesAway.tooltip.label.fontSize = 13;
        seriesAway.adapter.add('tooltipText', (text, target/* LineSeriesDataItem*/) => {
            var data = target.tooltipDataItem.dataContext;
            if (typeof data == 'undefined')
                return "";
            var val  = data.tooltip2
            var ret  = "";
            if (val){
                var arr = val.split(',');
                for (var i in arr) {
                    var tx = arr[i];
                    var ar = tx.split('|');
                    if (ret)
                        ret += "\n";
                    ret += chartUtil.hsecs2str(ar[0], ar[1]) + " " + ar[2];
                    
                }
            }
            return ret;
        });

        // Add simple bullet
        var bullet1 = seriesHome.bullets.push(new am4charts.Bullet());
        var image1 = bullet1.createChild(am4core.Image);
        image1.propertyFields.href = "bullet1";
        //image1.width = 13;
        image1.height = 10;
        image1.horizontalCenter = "middle";
        image1.verticalCenter = "middle";
        image1.propertyFields.tooltipText = "tooltip1";

        var bullet2 = seriesAway.bullets.push(new am4charts.Bullet());
        var image2 = bullet2.createChild(am4core.Image);
        image2.propertyFields.href = "bullet2";
        //image2.width = 13;
        image2.height = 10;
        image2.horizontalCenter = "middle";
        image2.verticalCenter = "middle";
        image2.propertyFields.tooltipText = "tooltip2";
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = seriesHome;
        cursor.xAxis = xAxis;
        cursor.lineX.disabled = true;
        cursor.lineY.disabled = true;
        cursor.behavior = "none"; // none,zoomX,zoomY,zoomXY,panX,panY,panXY
        /*
        var range = xAxis.axisRanges.create();
        range.category = "5";
        range.endCategory = "90+";
        range.axisFill.fill = am4core.color("#fff");//"#2c2f32");
        range.axisFill.fillOpacity = 0.03;
        range.grid.strokeOpacity = 0;
        range.label.disabled = true;
        */
        
        return chart;
    }
    
  , timeline_load : function(chart, timeline=[], reverse=false){
    
        var _data  = [];
        var len    = timeline.length;
        var minVal = 0; //parseFloat(avg);
        var maxVal = 0; //parseFloat(avg);
        var xAxis  = chart.xAxes.values[0];
        var yAxis  = chart.yAxes.values[0];
        
        // timeline 배열을 그냥 Looping하면 
        // '45+'와 '90+'가 제일 뒤로 처지는 문제 해결
        var sorted_keys 
            = [  '5','10','15','20','25','30','35','40','45','45+'
              , '50','55','60','65','70','75','80','85','90','90+' 
              ];
        
        sorted_keys.forEach(function(mins){
            
            var el = timeline[mins];
            var v1 = (typeof el == 'undefined' || typeof el.H == 'undefined') ? 0 : el.H.TAP;
            var v2 = (typeof el == 'undefined' || typeof el.A == 'undefined') ? 0 : el.A.TAP;
            var t1 = (typeof el == 'undefined' || typeof el.H == 'undefined') ? 0 : el.H.GOL_str;
            var t2 = (typeof el == 'undefined' || typeof el.A == 'undefined') ? 0 : el.A.GOL_str;
            var b1 = (typeof el != 'undefined' && typeof el.H != 'undefined' && el.H.GOL > 0) ? "/img/soccer-ball"+el.H.GOL+".png" : "";
            var b2 = (typeof el != 'undefined' && typeof el.A != 'undefined' && el.A.GOL > 0) ? "/img/soccer-ball"+el.A.GOL+".png" : "";
            
            _data.push({ "time"    : mins
                       , "value1"  : (reverse ? v2 : v1)
                       , "value2"  : (reverse ? v1 : v2)
                       , "bullet1" : (reverse ? b2 : b1)
                       , "bullet2" : (reverse ? b1 : b2)
                       , "tooltip1": (reverse ? t2 : t1)
                       , "tooltip2": (reverse ? t1 : t2)
                       });
            
             if (minVal > parseFloat(v1)) minVal = parseFloat(v1);
             if (minVal > parseFloat(v2)) minVal = parseFloat(v2);
             if (maxVal < parseFloat(v1)) maxVal = parseFloat(v1);
             if (maxVal < parseFloat(v2)) maxVal = parseFloat(v2);
        });
        
        yAxis.min = minVal - (maxVal - minVal)*0.1;
        yAxis.max = maxVal + (maxVal - minVal)*0.1;
        
        chart.data = _data;
    }
    
    //
    // Matchon Detail : DMI
    //
  , matchon_detail_dmi_init : function(wid, wcode){
    
        var chart = am4core.create(wid, am4charts.XYChart);
        chart.align = "center";
        chart.marginTop     = 0;
        chart.marginBottom  = 0;
        chart.marginLeft    = 0;
        chart.marginRight   = 0;
        chart.paddingTop    = 20;
        chart.paddingBottom = 0;
        chart.paddingLeft   = 0;
        chart.paddingRight  = 20;
      //chart.maxZoomLevel  = 1;
      //chart.seriesContainer.draggable = false;
      //chart.seriesContainer.resizable = false;
      //chart.zoomOutButton.disabled = true;
        
        var xAxis = chart.xAxes.push(new am4charts.ValueAxis());
        xAxis.title.text = "TAP";
        xAxis.title.fill = am4core.color(this.color.axisTitle);
        xAxis.title.marginTop = 5;
        xAxis.title.fontSize = 13;
        xAxis.renderer.minGridDistance = 0.01;
        xAxis.renderer.line.strokeOpacity = 1;
        xAxis.renderer.line.strokeWidth = 1;
        xAxis.renderer.line.stroke = am4core.color(this.color.axisLine);
        xAxis.renderer.baseGrid.disabled = true;
        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.labels.template.disabled = true;
        xAxis.tooltip.fontSize = 13;
        xAxis.cursorTooltipEnabled = false;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "ASR";
        yAxis.title.fill = am4core.color(this.color.axisTitle);
        yAxis.title.marginRight = 5;
        yAxis.title.fontSize = 13;
        yAxis.renderer.minGridDistance = 0.01;
        yAxis.renderer.line.strokeOpacity = 1;
        yAxis.renderer.line.strokeWidth = 1;
        yAxis.renderer.line.stroke = am4core.color(this.color.axisLine);  
        yAxis.renderer.baseGrid.disabled = true;
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.labels.template.disabled = true;
        yAxis.tooltip.fontSize = 13;
        yAxis.cursorTooltipEnabled = false;
        
        var series = chart.series.push(new am4charts.LineSeries());
        series.name = "matches";
        series.dataFields.valueX = "x";
        series.dataFields.valueY = "y";
        series.strokeWidth = 0;
        //series.tooltipText = "{pname}\nTAP [bold]{x}[/]\nASR [bold]{y}[/]"; //"{round}R : TAP [bold]{x}[/], CTP [bold]{y}[/]";
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = am4core.color((wcode=='A') ? "#bc15cb" : "#d21f5e");
        series.tooltip.label.fill = am4core.color("#fff");
        series.tooltip.label.fontSize = 13;
        series.adapter.add('tooltipText', (text, target/* LineSeriesDataItem*/) => {
            var data = target.tooltipDataItem.dataContext;
            if (typeof data == 'undefined'){
                return "";
            }
            return data.pname+"\nTAP [bold]"+data.x+"[/]\nASR [bold]"+(parseFloat(data.y)*100).toFixed(1)+"%[/]";
        });

        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.radius = 4;
        bullet.circle.strokeWidth =0;
        bullet.circle.fill = am4core.color((wcode=='A') ? "#bc15cb" : "#d21f5e");

        var label = series.bullets.push(new am4charts.LabelBullet());
        label.label.text = "{pname}";
        label.label.fontSize = 10;
        label.label.fontWeight = "300";
        label.label.fill = am4core.color("#fff");
        label.label.dy = -10;
        label.label.truncate = false;
        
        var cursor = chart.cursor = new am4charts.XYCursor();
        cursor.snapToSeries = series;
        cursor.xAxis = xAxis;
        cursor.yAxis = yAxis;
        cursor.lineX.disabled = true;
        cursor.lineY.disabled = true;
        cursor.behavior = "none"; // none,zoomX,zoomY,zoomXY,panX,panY,panXY
        
        return chart;
    }
    
  , matchon_detail_dmi_load : function(chart, players=[], avg_x=0, avg_y=0){
    
        var _data = [];
        var len   = players.length;
        var min_x = parseFloat(avg_x);
        var max_x = parseFloat(avg_x);
        var min_y = parseFloat(avg_y);
        var max_y = parseFloat(avg_y);
        var xAxis = chart.xAxes.values[0];
        var yAxis = chart.yAxes.values[0];

        players.forEach(function(el, idx, arr){
            //var r = el.gm_round;
            var x = (typeof el.gp_tap != 'undefined') ? el.gp_tap : parseFloat(el.tap).toFixed(1);
            var y = (typeof el.gp_asr != 'undefined') ? el.gp_asr : el.asr;
            if (x == 0 || y == 0) // 활약이 없는 경우 제외
                return;
            _data.push({ "pname":el.p_name_en, "x":x , "y":y });
             if (min_x > x) min_x = parseFloat(x);
             if (max_x < x) max_x = parseFloat(x);
             if (min_y > y) min_y = parseFloat(y);
             if (max_y < y) max_y = parseFloat(y);
        });
        xAxis.min = min_x - (max_x - min_x)*0.1;
        xAxis.max = max_x + (max_x - min_x)*0.1;
        yAxis.min = min_y - (max_y - min_y)*0.15;
        yAxis.max = max_y + (max_y - min_y)*0.15;
        
        chart.data = _data;
        
        // Average line Y
        yAxis.axisRanges.clear();
        var range_y = yAxis.axisRanges.create();
        range_y.value = avg_y;
        range_y.grid.stroke = am4core.color(this.color.guide);
        range_y.grid.strokeWidth = 1;
        range_y.grid.strokeOpacity = 1;
        range_y.grid.strokeDasharray = "4,2"
        range_y.label.text = "EPL AVG " + (parseFloat(avg_y)*100).toFixed(1) + "%";
        range_y.label.inside = true;
        range_y.label.rotation = 90;
        range_y.label.fontWeight = "normal";
        range_y.label.fontSize = 12;
        range_y.label.fill = range_y.grid.stroke;
        range_y.label.align = "right";
        range_y.label.dx = 8
        range_y.label.horizontalCenter = "middle";
        
        // Average line X
        xAxis.axisRanges.clear();
        var range_x = xAxis.axisRanges.create();
        range_x.value = avg_x;
        range_x.axisFill.fillOpacity = 0;
        range_x.grid.stroke = am4core.color(this.color.guide);
        range_x.grid.strokeWidth = 1;
        range_x.grid.strokeOpacity = 1;
        range_x.grid.strokeDasharray = "4,2"
        range_x.label.text = "EPL AVG " + parseFloat(avg_x).toFixed(2);;
        range_x.label.inside = true;
        range_x.label.fontWeight = "normal";
        range_x.label.fontSize = 12;
        range_x.label.fill = range_x.grid.stroke;
        range_x.label.valign = "top";
        range_x.label.dy = -27;
        range_x.label.horizontalCenter = "middle";
        
        // Set Range
        /*
        var range_bg = xAxis.axisRanges.create();
        range_bg.value = xAxis.min;
        range_bg.endValue = xAxis.max;
        range_bg.axisFill.fill = am4core.color("#fff");//"#2c2f32");
        range_bg.axisFill.fillOpacity = 0.03;
        range_bg.grid.strokeOpacity = 0;
        range_bg.label.disabled = true;
        */
    }
}