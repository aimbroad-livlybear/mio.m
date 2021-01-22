
//
// Console 로그출력
//
timelog = function(txt){
    var d = new Date();
    // console.log("["+d.getHours() + ":" + d.getMinutes() + ":"  + d.getSeconds() + ":" + d.getMilliseconds() + "] " +txt);
};

//
// SELECTBOX 처리
//
mobiscroll.settings = {
    theme: 'material',
    themeVariant: 'light'
};
var TOUCH = "ontouchstart" in window;
var tevent = '';
if (TOUCH){
    tevent = "touchstart";
}else{
    tevent = "click";
}

//
// Loading
//
var loading = {
    
    init  : false
  , timer : null
  , $dim  : $("<div class='layout-loading-wrapper' >")
  , $img  : $("<img src='/img/loading.png' alt='loading' />")
  
  , proc  : function(){
        dim = this.$dim;
        dim.fadeIn(300);
        setTimeout(function(){
            dim.addClass("on")
        },0);
    }
    
  , start : function(delay=500){
        timelog("loading started");
        if (!this.init){
            this.$img.appendTo(this.$dim);
            this.$dim.appendTo($(document.body));
        }
        if (this.timer != null){
            clearTimeout(this.timer);
        }
        dim = this.$dim;
        this.timer = setTimeout(function(){
            dim.stop().fadeIn(300);
            setTimeout(function(){
                dim.addClass("on");
            },0);
        }, delay); // 0.5초 딜레이 후 시작
    }
    
  , stop : function(){
        timelog("loading stopped");
        if (this.timer != null){
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.$dim.removeClass("on").stop().fadeOut(300);
    }
}

//
// 상세팝업 (Team, Player)
//
var popup_team_open = function(tcode,sname=''){
    loading.start();
    $(".pop-load-wrap").addClass("ing");
    $(".pop-load-wrap").empty().load("/detail_team", { "tcode":tcode, "sname":sname }, function(){
        $(".pop-load-wrap").addClass("on");
    });
}

//
// 상세팝업 (Player)
//
var popup_player_open = function(pid,sname=''){
    loading.start();
    $(".pop-load-wrap").addClass("ing");
    $(".pop-load-wrap").empty().load("/detail_player", { "pid":pid, "sname":sname }, function(){
        $(".pop-load-wrap").addClass("on");
    });
}

//
// 가이드 관련 스크립트
//
$(function(){
    $(".opn,#LAYOUT-GUIDE-BTN-POPUP a.opn").click(function(){
        if ($("#LAYOUT-GUIDE").hasClass("on"))
            return false;
        $("#LAYOUT-GUIDE").addClass("on");
    });
    $("#LAYOUT-GUIDE-BTN a.top").click(function(){
        $('html, body').animate({scrollTop: '0'}, 500);
    });
    $("#LAYOUT-GUIDE-BTN-POPUP a.top").click(function(){
        $('#pop-page').animate({scrollTop: '0'}, 500);
    });
    $("#LAYOUT-GUIDE a.close").click(function(){
        $("#LAYOUT-GUIDE").removeClass("on");
    });
    $("#LAYOUT-GUIDE > .list > .wrap > .scroll > table tr").click(function(){
        var tactic = $(this).data("tactic");
        $("#LAYOUT-GUIDE > .list > .wrap > .scroll > table tr.on").removeClass("on");
        $(this).addClass("on");
        $("#LAYOUT-GUIDE > .content > .itm.on").removeClass("on");
        $("#LAYOUT-GUIDE > .content > .itm."+tactic).addClass("on");
    });
})

if (!Object.entries)
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
    return resArray;
  };
  
//
// SELECTBOX
//
$(function(){
    $.fn.selectEx = function (options) {
        if (this.length === 0) {
            return this;
        }

        // support multiple elements
        if (this.length > 1) {
            this.each(function() {
                $(this).selectEx(options);
            });
            return this;
        }

        var el = this;

        if ($(el).data('selectEx')) {
            return $(el).data('selectEx');
        }

        el.$wrp = $(el);
        el.$val = el.$wrp.children(".select-item");
        el.$lst = el.$wrp.children("ul");
        el.f_change = null;

        var init = function () {
            if ($(el).data('selectEx')) {
                return $(el).data('selectEx');
            }

            el.$val.click(function(){
                if (el.$wrp.hasClass("on")){
                    el.$wrp.removeClass("on");
                }else{
                    el.$wrp.removeClass("on");
                    el.$wrp.addClass("on");
                }
            });

            el.$lst.find("li > a").each(function(){
                handler_item_click($(this));
            })

            el.$wrp.mouseleave(function(){
                el.$wrp.removeClass("on");
            });
        }

        var handler_item_click = function($item){
            $item.click(function(){
                el.$itm = $(this);
                
                var $span  = el.$val.children("span");
                var oldVal = $span.data("value");
                var oldTxt = $span.text();
                var newVal = $(this).data("value");
                var newTxt = $(this).text();
                
                for (k in $(this).data()){
                    var v = $(this).data()[k];
                    el.$val.data(k, v);
                }
                
                $span.data("value",newVal).text(newTxt);
                el.$wrp.removeClass("on");

                if (oldVal != newVal && el.f_change){
                    el.f_change(oldVal, oldTxt, newVal, newTxt);
                }
            });

        }

        el.val = function (val=null, ignoreEvent=false) {
            var $span = el.$val.children("span");

            if (typeof val !== 'undefined' && val != null) {
                var oldVal = $span.data("value");
                var oldTxt = $span.text();
                var newVal = "";
                var newTxt = "";
                el.$lst.find("li > a").each(function () {
                    var v = $(this).data("value");
                    if (v == val) {
                        for (k in $(this).data()){
                            var v = $(this).data()[k];
                            el.$val.data(k, v);
                        }
                        $span.data("value", newVal=v).text(newTxt=$(this).text());
                        return false;
                    }
                });
                if (oldVal != newVal && el.f_change && !ignoreEvent){
                    el.f_change(oldVal, oldTxt, newVal, newTxt);
                }
                return this;
            } else {
                return el.$val.children("span").data("value");
            }
        };

        el.text = function(){
            return el.$val.children("span").text();
        }

        el.data = function(k,v) {
            if (typeof v != 'undefined' && v ){
                el.$val.data(k,v);
                return this;
            }else{
                return el.$val.data(k);
            }
        }

        el.change = function(func){
            el.f_change = func;
        }

        el.addItem = function(val, txt, cls='', data=[]){
            var $itm = $("<li>");
            var $lnk = $("<a href='javascript:;' data-value="+val+" class="+cls+">").text(txt);
            $lnk.appendTo($itm);
            
            if (data){
                for (k in data){
                    var v = data[k];
                    $lnk.data(k, v);
                }
            }            
            
            $itm.appendTo(el.$lst);
            handler_item_click($lnk);
        }
        
        el.clearItem = function(cls){
            if (typeof cls != 'undefined' && cls){
                el.$lst.children("li").each(function(){
                    if ($(this).children("a").hasClass(cls)){
                        $(this).remove();
                    }
                });
            }else{
                el.$lst.empty();
            }
        }

        init();

        $(el).data('selectEx', this);

        return this;
    }

    $(".select-wrap").selectEx();
});

//
// Formation
//
var formationUtil = {
    
    // 포메이션별 선수 위치 설정
    reset_pos : function(){
        
        $(".formation-box .formation-map").each(function(){
            var $wrp = $(this);
            var $lst = $wrp.children(".formations:first");
            var $items = $lst.children("li.pointer:not(.skeleton)");
            var formation_str = $wrp.data("formation");
            var formation_arr = formation_str.split('-').reverse();
            
            if (formation_arr.length < 1)
                return;
            // console.log(formation_str);
            var cy = 100 / (formation_arr.length + 1);
            var num = 0;
            
            formation_arr.forEach(function(cnt, idx, arr){
                var cx = ((cnt == 2) ? 70 : 100) / cnt;
                for (i = 0; i < cnt; i++) {
                     var $itm = $items.eq(num++);
                     if ($itm.length < 1)
                        return false;
                     $itm.css({width:cx+"%", height:cy+"%", left:"auto", top:"auto"});
                     if (cnt == 2){
                        if (i==0)
                            $itm.css("padding-left", "15%");
                        else
                            $itm.css("padding-right", "15%");
                     }
                }
            });
            // 골키퍼 처리
            $items.eq(num).css({width:"100%", height:cy+"%", left:"auto", top:"auto"});
        })
        
    }
    
};

$(function(){
    /*
	if($("#salary-tabs").length){
		var _endType = 1950;
		var _liveType = 1150;
		var _watingType = 450;
		$(".container").scroll(function() {
			var _endCls = $("#salary-tabs").hasClass("end-type");
			var _liveCls = $("#salary-tabs").hasClass("live-type");
			var _watingCls = $("#salary-tabs").hasClass("wating-type");


			var scroll = $(".container").scrollTop();

			if(scroll > 120) {
				$(".container").addClass("match-active");
			}else {
				$(".container").removeClass("match-active");
			}

			if(_endCls){
				var _tabItem = $("#salary-tabs").offset().top + _endType;
			}
			if(_liveCls){
				var _tabItem = $("#salary-tabs").offset().top + _liveType;
			}
			if(_watingCls){
				var _tabItem = $("#salary-tabs").offset().top + _watingType;
			}

			if(scroll > _tabItem){
				$(".container").addClass("tab-active");
			} else {
				$(".container").removeClass("tab-active");
			}
		});
	}
    */

    /*
	$("body").on("touchstart", ".fav-wrap", function(){
		var $this = $(this);
		$this.find("img").attr("src", function(index, attr){
			if(attr.match('-on')){
				return attr.replace("-on.svg", "-off.svg");
			}else{
				return attr.replace("-off.svg", "-on.svg");
			}
		})
    });
    */

    /*
    $("body").on("click", ".btn-name-edit", function(){
        $(".profile-wrap").addClass("on");
		$(".profile-wrap .inp").prop("readonly", false);
    });
	$("body").on("click", ".btn-wrap .edit-cancel", function(){
        $(".profile-wrap").removeClass("on");
		$(".profile-wrap .inp").prop("readonly", true);
    });
	$("body").on("click", ".btn-wrap .edit-ok", function(){
        $(".profile-wrap").removeClass("on");
		$(".profile-wrap .inp").prop("readonly", true);
    });
    */

    /*
	$("body").on("click", ".select-wrap>a", function(){
        $(".select-wrap").removeClass("on");
        $(this).parents(".select-wrap").addClass("on");
    });
    $("body").on("click", ".select-wrap ul a", function(){
        var _target = $(this).parents(".select-wrap").eq(0);
        _target.removeClass("on");
        _target.find("span").text($(this).text());
    });
    $("body").on("mouseleave", ".select-wrap", function(){
        $(".select-wrap").removeClass("on");
    });
    */

	/*
    $("body").on("click", ".rs-tabs a", function(){
        $(".rs-tabs a").removeClass("on");
        $(this).addClass("on");
    });
	*/
    $("body").on("click", ".game-tabs01 a", function(){
        $(".game-tabs01 a").removeClass("on");
        $(this).addClass("on");
    });
    $("body").on("click", ".game-tabs02 a", function(){
        $(".game-tabs02 a").removeClass("on");
        $(this).addClass("on");
    });
    $("body").on("click", ".game-time-slide button", function(){
        $(".game-time-slide button").removeClass("on");
        $(this).addClass("on");
    });
    $("body").on("click", ".ranking-wrap a", function(){
        $(".ranking-wrap a").removeClass("on");
        $(this).addClass("on");
    });
    $("body").on("click", ".top-player-area .top-tabs li a", function(){
        $(".top-player-area .top-tabs li a").removeClass("on");
        $(this).addClass("on");
        /*
		$(".nor-page-area").removeClass("on");
		setTimeout(function(){
			$(".nor-page-area").addClass("on");
		},500);
		*/
    });
	/*
    $("body").on("click", ".player-tabs li a", function(){
        $(".player-tabs li a").removeClass("on");
        $(this).addClass("on");
    });
	*/
	/*
    $("body").on("click", ".noti-tabs li a", function(){
        $(".noti-tabs li a").removeClass("on");
        $(this).addClass("on");
		$(".nor-page-area").removeClass("on");
		setTimeout(function(){
			$(".nor-page-area").addClass("on");
		},500);
    });
    */
    /*
	$("body").on("click", ".event-tabs li a", function(){
        $(".event-tabs li a").removeClass("on");
        $(this).addClass("on");
		$(".nor-page-area").removeClass("on");
		setTimeout(function(){
			$(".nor-page-area").addClass("on");
		},500);
    });
    */
    /*
    $("body").on("click", ".time-setting .time-side .time-item ul li a", function(){
        $(this).parents("ul").eq(0).find("a").removeClass("on");
        $(this).addClass("on");
    });
    $("body").on("click", ".home-tabs li a", function(){
        $(".home-tabs li a").removeClass("on");
        $(this).addClass("on");
    });
	$("body").on("click", ".time-header a", function(){
		var ck = $(this).hasClass("on");
		if(ck){
			$(this).removeClass("on");
			$(".time-setting").removeClass("on");
		}else{
			$(this).addClass("on");
			$(".time-setting").addClass("on");
		}
	});
	$("body").on("click", ".time-setting a.btn-cancel, .time-setting a.btn-ok", function(){
		$(".time-setting").removeClass("on");
		$(".time-header a").removeClass("on");
	});
	*/
	/*
    $("body").on("click", ".detail-tabs li a", function(){
        $(".detail-tabs li a").removeClass("on");
        $(this).addClass("on");
		$(".nor-page-area").removeClass("on");
		setTimeout(function(){
			$(".nor-page-area").addClass("on");
		},500);
    });
	*/

    // detail_player, detail_team
    $("body").on("click", ".rating-slide-wrap button", function(){
        $(".rating-slide-wrap button").removeClass("on");
        $(this).addClass("on");
    });

    // matchon_wating, matchon_end
    $("body").on("click", ".salary-tabs li a", function(){
        $(".salary-tabs li a").removeClass("on");
        $(this).addClass("on");
		/*
		$(".nor-page-area").removeClass("on");
		setTimeout(function(){
			$(".nor-page-area").addClass("on");
		},500);
		*/
    });

    $("body").on("click", ".pop-calendar table td button", function(){
        $(".pop-calendar table td button").removeClass("active");
        $(this).addClass("active");
    });

    $("body").on("click", ".date-slide-wrap button", function(){
        $(".date-slide-wrap button").removeClass("active");
        $(this).addClass("active");
    });



});


common = {
    layerClose:function(event){
        var ele = event.target.className;
        if(ele.indexOf('all-menu-wrap') != -1){
            $(".all-menu-wrap").removeClass("on");
            setTimeout(function(){
                $(".all-menu-wrap").removeClass("ing");
            },500)
        }
    },
    popOpen:function(o){
        $(o).addClass("ing");
        setTimeout(function(){
            $(o).addClass("on");
        },200);
    },
    popClose:function(o){
        $(o).removeClass("on");
        setTimeout(function(){
            $(o).removeClass("ing");
        },500)
    },
    /*
    // ainews 에서 사용
    gaugeChart:function(teamName1, teamName2, teamValue1, teamValue2){
        var gchart = bb.generate({
            data: {
                columns: [
                    [teamName1, teamValue1],
                    [teamName2, teamValue2]
                ],
                order: null,
                type: "gauge",
                labels:{show:false},
                innerRadius: 0
            },
            gauge: {
                width: 10
            },
            color: {
                pattern: [
                    "#d21f5e",
                    "#326db6"
                ]
            },
            legend: {
                show: false
            },
            tooltip: {
                show: false
            },
            size: {
                height: 100
            },
            bindto: "#gaugeChart"
        });
        setTimeout(function(){
            var _deg = 180*(teamValue1 * 0.01);
            // console.log(_deg);
            $(".needle").css("transform", "rotate("+_deg+"deg)");
        },100)
    },
    */
    /*splinechart:function(teamName1, teamName2){


        var splinechart = bb.generate({
            padding: {
                top: 0,
                right: 20,
                bottom: 10,
                left:20
            },
            data: {
                x: "x",
                columns: [
                    ["x", "5", "15", "25", "35", "45", "50", "60", "70", "80", "90"],
                    [teamName1, 1, 4, 5, 6, 6, 1, 4, 5, 6, 6],
                    [teamName2, 5, 6, 6, 1, 4, 5, 6, 6, 1, 4]
                ],
                type: "spline",
                labels: { },
                onover: function(d, i) {
					console.log(d.index);
					var ck = d.index;
					if(ck==0 || ck==2 || ck==7){
						setTimeout(function(){
							$(".chart-tooltip-wrap").addClass("on");
						},300);
					}else{
						$(".chart-tooltip-wrap").removeClass("on");
					}
                    //console.log("onover", d, i);
                },
                onout: function(d, i) {
                    console.log("onout", d, i);
                }
            },
			tooltip: {
				// grouped: false,
				contents: {
				  //template: "<ul class='chart-tooltip-wrap'><li>{=TITLE}</li>{{<li style=color:{=COLOR}>{=NAME}: {=VALUE}</li>}}</ul>"
				  template: "<ul class='chart-tooltip-wrap'><li>{=TITLE}</li><li>H2 81:01 H.Kane</li><li>H2 81:01 H.Kane</li><li>H2 83:28 Son</li>{{}}</ul>"
				}
			},
            legend: {
                show: false
            },
            point: {
                //show: false
                pattern: [
                    '<g><image transform="translate(-5,-5)" width="10" height="10" href="/img/bg/bg-soccer-ball.svg"></image></g>',
                    '<g><image transform="translate(-5,-5)" width="10" height="10" href="/img/bg/bg-soccer-ball.svg"></image></g>'
                ]/!*
                pattern: [
                    '<g><image transform="translate(-5,-5)" width="10" height="10" xlink:href="/img/bg/bg-soccer-ball.svg"></image></g>'
                ]
                *!/
            },
            color: {
                pattern: [
                    "#a12e58",
                    "#822cc5"

                ]
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
                    type: "category"
                },
                y: { show: false }
            },
            bindto: "#splinechart"
        });
        //splinechart.selected(teamName1);
        //splinechart.select(teamName1, [1]);

        // 축구공 선택
        setTimeout(function(){
            $(".bb-shapes-"+teamName1+" use.bb-shape-0").addClass("active");
            $(".bb-shapes-"+teamName2+" use.bb-shape-2").addClass("active");
            $(".bb-shapes-"+teamName1+" use.bb-shape-7").addClass("active");
        },500);
    },*/
    /*splinechart01:function(_id, teamName1, teamName2){
        var splinechart = bb.generate({
            padding: {
                top: 0,
                right: 20,
                bottom: 10,
                left:20
            },
            data: {
                x: "x",
                columns: [
                    ["x", "5", "15", "25", "35", "45", "50", "60", "70", "80", "90"],
                    [teamName1, 1, 4, 5, 6, 6, 1, 4, 5, 6, 6],
                    [teamName2, 5, 6, 6, 1, 4, 5, 6, 6, 1, 4]
                ],
                type: "spline",
                labels: { },
                onover: function(d, i) {
                    console.log("onover", d, i);
                },
                onout: function(d, i) {
                    console.log("onout", d, i);
                }
            },
            legend: {
                show: false
            },
            point: {
                //show: false
                pattern: [
                    '<g><image transform="translate(-5,-5)" width="10" height="10" href="/img/bg/bg-soccer-ball.svg"></image></g>',
                    '<g><image transform="translate(-5,-5)" width="10" height="10" href="/img/bg/bg-soccer-ball.svg"></image></g>'
                ]/!*
                pattern: [
                    '<g><image transform="translate(-5,-5)" width="10" height="10" xlink:href="/img/bg/bg-soccer-ball.svg"></image></g>'
                ]
                *!/
            },
            color: {
                pattern: [
                    "#a12e58",
                    "#822cc5"

                ]
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
                    type: "category"
                },
                y: { show: false }
            },
            bindto: _id
        });
        //splinechart.selected(teamName1);
        //splinechart.select(teamName1, [1]);

        // 축구공 선택
        setTimeout(function(){
            $(".bb-shapes-"+teamName1+" use.bb-shape-0").addClass("active");
            $(".bb-shapes-"+teamName2+" use.bb-shape-2").addClass("active");
            $(".bb-shapes-"+teamName1+" use.bb-shape-7").addClass("active");
        },500);
    },*/
    /*
    bubbleChart:function(teamName1, teamName2){
        var bubbleChart = bb.generate({
            padding: {
                top: 0,
                right: 0,
                bottom: 10,
                left:0
            },
            data: {
                columns: [
                    [teamName1, 30, 350, 200, 380, 150, 250, 50],
                    [teamName2, 130, 100, 10, 200, 80, 50, 200],
                ],
                type: "bubble",
                labels: {
                    format: function(v, id) {
                        console.log(id);
                        return id;
                    },
                    position:{
                        y:-15
                    }
                }
            },
            legend: {
                show: false
            },
            bubble: {
                maxR: 10
            },
            color: {
                pattern: [
                    "#a12e58",
                    "#822cc5"

                ]
            },
            grid: {
                x: {
                    lines: [
                        {
                            value: 3.0,
                            text: "EPL AVG 2.27", class: "label-x"
                        }
                    ]
                },
                y: {
                    lines: [
                        {
                            value: 150,
                            text: "EPL AVG 2.27", class: "label-y"
                        }
                    ]
                }
            },
            axis: {
                x: {
                    label: "TAP"
                },
                y: {
                    label: "ASR",
                    max: 450
                }
            },
            bindto: "#bubbleChart"
        });
        // 축구공 선택
        setTimeout(function(){
            $(".bb-texts-"+teamName1+" text.bb-text-2").addClass("active");
            $(".bb-texts-"+teamName1+" text.bb-text-3").addClass("active");
            $(".bb-texts-"+teamName1+" text.bb-text-4").addClass("active");
        },500);
    },
	bubbleChart01:function(teamName1, teamName2){
        var bubbleChart = bb.generate({
            padding: {
                top: 0,
                right: 0,
                bottom: 10,
                left:0
            },
            data: {
                columns: [
                    [teamName1, 30, 350, 200, 380, 150, 250, 50],
                    [teamName2, 130, 100, 10, 200, 80, 50, 200],
                ],
                type: "bubble",
                labels: {
                    format: function(v, id) {
                        console.log(id);
                        return id;
                    },
                    position:{
                        y:-15
                    }
                }
            },
            legend: {
                show: false
            },
            bubble: {
                maxR: 10
            },
            color: {
                pattern: [
                    "#a12e58",
                    "#822cc5"

                ]
            },
            grid: {
                x: {
                    lines: [
                        {
                            value: 3.0,
                            text: "EPL AVG 2.27", class: "label-x"
                        }
                    ]
                },
                y: {
                    lines: [
                        {
                            value: 150,
                            text: "EPL AVG 2.27", class: "label-y"
                        }
                    ]
                }
            },
            axis: {
                x: {
                    label: "TAP"
                },
                y: {
                    label: "ASR",
                    max: 450
                }
            },
            bindto: "#bubbleChart01"
        });
        // 축구공 선택
        setTimeout(function(){
            $(".bb-texts-"+teamName1+" text.bb-text-2").addClass("active");
            $(".bb-texts-"+teamName1+" text.bb-text-3").addClass("active");
            $(".bb-texts-"+teamName1+" text.bb-text-4").addClass("active");
        },500);
    },
    */
    pieLoad:function(t, o, c01, c02, _size){
        if(o == 0){
            $(t).addClass("off");
        }else{
            $(t).easyPieChart({
                //easing: 'easeOutBounce',
                barColor: c01,
                trackColor: c02,
                scaleColor: '#fff',
                scaleLength: 0,
                lineWidth: 13,
                size: _size,
                lineCap: 'butt',
                animate: 1000,
                onStep: function(from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                },
                onStop:function(from, to) {
                    console.log('end');
                }
            });
            var chart = window.chart = $(t).data('easyPieChart');
            chart.update(o);
        }
    },
    scrollChart:function(_id, _color){
        // 차트 사이즈 셋
        var _data = ["TOT", 50, 70, 20, 50, 70, 20, 50, 70, 20];

        var scrollChart = bb.generate({
            size: {
                width: parseInt((_data.length-1)*70),
                height:240
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 0,
                left:0
            },
            data: {
                x: "x",
                columns: [
                    ["x", "July 02.20", "July 02.21", "July 02.22","July 02.23", "July 02.24", "July 02.25","July 02.26", "July 02.27", "July 02.28"],
                    _data
                ],
                type: "spline",
                labels: true
            },
            color: {
                pattern: [
                    _color
                ]
            },
            axis: {
                x: {
                    type: "category",
                    tick: {
						show: false,
							show: false,
							text: {
								show: false
							}
						//multiline: true,
                        //tooltip: true
                    }
                },
                y: { show: false }
            },
            legend: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    lines: [
                        {
                            value: 20,
                            text: ""
                        }
                    ]
                }
            },
            bindto: _id
        });
    },
    /*splineChart:function(){
		// 차트 사이즈 셋
        var _data = ["TOT", 50, 70, 20, 50, 70, 20, 50, 70, 20, 50, 70, 20];

        var splineChart = bb.generate({
			size: {
                width: parseInt((_data.length-1)*40),
                height:240
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left:0
            },
			margin:{right:20},
            data: {
                x: "x",
                columns: [
                    ["x", "1R", "2R", "3R","4R", "5R", "38R","33R", "34R", "35R","36R", "37R", "38R"],
                    _data
                ],
                type: "spline",
                labels: true
            },
            color: {
                pattern: [
                    "#e63a79"
                ]
            },
            axis: {
                x: {
                    type: "category",
                    tick: {
                        multiline: true,
                        tooltip: true
                    }
                },
                y: { show: false }
            },
            legend: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    lines: [
                        {
                            value: 20,
                            text: "EPL AVG   5.83"
                        }
                    ]
                }
            },
            bindto: "#spline"
        });
    },*/
	/*splineChart02:function(){
		// 차트 사이즈 셋
        var _data = ["TOT", 50, 70, 20, 50, 70, 20, 50, 70, 20, 50, 70, 20];

        var splineChart = bb.generate({
			size: {
                width: parseInt((_data.length-1)*40),
                height:240
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left:0
            },
			margin:{right:20},
            data: {
                x: "x",
                columns: [
                    ["x", "1R", "2R", "3R","4R", "5R", "38R","33R", "34R", "35R","36R", "37R", "38R"],
                    _data
                ],
                type: "spline",
                labels: true
            },
            color: {
                pattern: [
                    "#e63a79"
                ]
            },
            axis: {
                x: {
                    type: "category",
                    tick: {
                        multiline: true,
                        tooltip: true
                    }
                },
                y: { show: false }
            },
            legend: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    lines: [
                        {
                            value: 20,
                            text: "EPL AVG   5.83"
                        }
                    ]
                }
            },
            bindto: "#spline01"
        });
    },*/
    /*lineChart:function(){
        var lineChart = bb.generate({
            padding: {
                top: 0,
                right: 20,
                bottom: 20,
                left:30
            },
            data: {
                x: "x",
                columns: [
                    ["x", "33R", "34R", "35R","36R", "37R", "38R"],
                    ["TOT", 50, 70, 20, 50, 70, 20]
                ],
                labels: true
            },
            point: {
                pattern: [
                    "<g><circle cx='15' cy='15' r='15'></circle></g>"
                ]
            },
            color: {
                pattern: [
                    "#e63a79"
                ]
            },
            axis: {
                x: {
                    type: "category",
                    label: {
                        text: "TAP",
                        position: "inner-center"
                    }
                },
                y: {
                    label: {
                        text: "CTP",
                        position: "outer-middle"
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                x: {
                    lines: [
                        {
                            value: '34R',
                            text: ""
                        }
                    ]
                },
                y: {
                    lines: [
                        {
                            value: 20,
                            text: ""
                        }
                    ]
                }
            },
            bindto: "#lineChart"
        });
    },*/
    /*barChart:function(_d1, _d2){
        var types = {};
        types[_d1] = "bar";
        types[_d2] = "";

        var barChart = bb.generate({
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left:20
            },
            data: {
                x: "x",
                columns: [
                    ["x", "33R", "34R", "35R","36R", "37R", "38R"],
                    [_d1, 90, 100, 140, 200, 100, 400, 90, 100, 140, 200, 100, 400],
                    [_d2, 130, 40, 200, 310, 230, 325, 163, 230, 222, 240, 160, 310]
                ],
                types,
                labels: true
            },
			bar: {
				width: { ratio: 0.3 }
			},
            color: {
                pattern: [
                    "#e63a79",
                    "#00ce7d"
                ]
            },
            axis: {
                x: {
                    type: "category"
                },
                y: {
                    tick: {
                        show: false,
                        text: {
                            show: false
                        }
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                x: {
                    lines: [
                        {
                            value: '34R',
                            text: "EPL AVG 16.90"
                        }
                    ]
                }
            },
            bindto: "#barChart"
        });
    },*/
	/*barChart02:function(_d1, _d2){
        var types = {};
        types[_d1] = "bar";
        types[_d2] = "";

        var barChart = bb.generate({
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left:20
            },
            data: {
                x: "x",
                columns: [
                    ["x", "33R", "34R", "35R","36R", "37R", "38R"],
                    [_d1, 90, 100, 140, 200, 100, 400, 90, 100, 140, 200, 100, 400],
                    [_d2, 130, 40, 200, 310, 230, 325, 163, 230, 222, 240, 160, 310]
                ],
                types,
                labels: true
            },
			bar: {
				width: { ratio: 0.3 }
			},
            color: {
                pattern: [
                    "#e63a79",
                    "#00ce7d"
                ]
            },
            axis: {
                x: {
                    type: "category"
                },
                y: {
                    tick: {
                        show: false,
                        text: {
                            show: false
                        }
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                x: {
                    lines: [
                        {
                            value: '34R',
                            text: "EPL AVG 16.90"
                        }
                    ]
                }
            },
            bindto: "#barChart01"
        });
    },*/
    /*rotatedBarChart:function(_d1, _d2){
        var types = {};
        types[_d1] = "bar";
        types[_d2] = "";

        var rotatedBarChart = bb.generate({
            padding: {
                top: 0,
                right: 20,
                bottom: 20,
                left:50
            },
            data: {
                x: "x",
                columns: [
                    ["x", "CTB", "CTM", "CTA","CTS"],
                    [_d1, 90, 100, 140, 200],
                    [_d2, 130, 40, 200, 310]
                ],
                types,
                labels: true
            },
			bar: {
				width: { ratio: 0.3 }
			},
            color: {
                pattern: [
                    "#9a1de2",
                    "#00ce7d"
                ]
            },
            axis: {
                rotated: true,
                x: {
                    type: "category",
                },
                y: {
                    show: false,
                }
            },
            legend: {
                show: false
            },
            grid: {
                y: {
                    lines: [
                        {
                            value: '100',
                            text: "EPL AVG 16.90"
                        }
                    ]
                }
            },
            bindto: "#rotatedBarChart"
        });
    },*/
	/*rotatedBarChart02:function(_d1, _d2){
        var types = {};
        types[_d1] = "bar";
        types[_d2] = "";

        var rotatedBarChart = bb.generate({
            padding: {
                top: 0,
                right: 20,
                bottom: 20,
                left:50
            },
            data: {
                x: "x",
                columns: [
                    ["x", "CTB", "CTM", "CTA","CTS"],
                    [_d1, 90, 100, 140, 200],
                    [_d2, 130, 40, 200, 310]
                ],
                types,
                labels: true
            },
			bar: {
				width: { ratio: 0.3 }
			},
            color: {
                pattern: [
                    "#9a1de2",
                    "#00ce7d"
                ]
            },
            axis: {
                rotated: true,
                x: {
                    type: "category",
                },
                y: {
                    show: false,
                }
            },
            legend: {
                show: false
            },
            grid: {
                y: {
                    lines: [
                        {
                            value: '100',
                            text: "EPL AVG 16.90"
                        }
                    ]
                }
            },
            bindto: "#rotatedBarChart01"
        });
    }*/

}

/*
 * Framework JS
 */

// 쿠키 입력
function set_cookie(name, value, expirehours, domain)
{
    var today = new Date();
    today.setTime(today.getTime() + (60*60*1000*expirehours));
    document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + today.toGMTString() + ";";
    if (domain) {
        document.cookie += "domain=" + domain + ";";
    }
}


// 쿠키 얻음
function get_cookie(name)
{
    var find_sw = false;
    var start, end;
    var i = 0;

    for (i=0; i<= document.cookie.length; i++)
    {        
        start = i;
        end = start + name.length;

        if(document.cookie.substring(start, end) == name)
        {
            find_sw = true;
            break;
        }
    }

    if (find_sw == true)
    {
        start = end + 1;
        end = document.cookie.indexOf(";", start);

        if(end < start)
            end = document.cookie.length;

        return unescape(document.cookie.substring(start, end));
    }
    
    return "";
}

// 쿠키 지움
function delete_cookie(name)
{
    var today = new Date();

    today.setTime(today.getTime() - 1);
    var value = get_cookie(name);
    if(value != "")
        document.cookie = name + "=" + value + "; path=/; expires=" + today.toGMTString();
}

// full formatted date 반환 (yyyy-mm-dd H:i:s)
function get_formatted_date(date, ymd_delim, his_delim){
    var ymd = get_formatted_ymd(date, ymd_delim);
    var his = get_formatted_his(date, his_delim);
    
    return [ymd, his].join(' ');
}

// yyyy-mm-dd
function get_formatted_ymd(date, delimiter) {
    if (typeof date === 'undefined' || date === null) {
        date = new Date();
    }
    
    if (typeof delimiter === 'undefined' || delimiter === null) {
        delimiter = '-';
    }
    
    var year = date.getFullYear(),     //yyyy
        month = (1 + date.getMonth()), //M
        day = date.getDate();          //d
    
    month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
    day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
    
    return [year, month, day].join(delimiter);
}

// H:i:s
function get_formatted_his(date, delimiter) {
    if (typeof date === 'undefined' || date === null) {
        date = new Date();
    }
    
    if (typeof delimiter === 'undefined' || delimiter === null) {
        delimiter = ':';
    }
    
    var hours = date.getHours(),        // H
        minutes = date.getMinutes(),    // i
        seconds = date.getSeconds();    // s
    
    hours = (hours > 9 ? '' : '0') + hours;
    minutes = (minutes > 9 ? '' : '0') + minutes;
    seconds = (seconds > 9 ? '' : '0') + seconds;
    
    return [hours, minutes, seconds].join(delimiter);
}

function trim(s)
{
    var t = "";
    var from_pos = to_pos = 0;

    for (i=0; i<s.length; i++)
    {
        if (s.charAt(i) == ' ')
            continue;
        else
        {
            from_pos = i;
            break;
        }
    }

    for (i=s.length; i>=0; i--)
    {
        if (s.charAt(i-1) == ' ')
            continue;
        else
        {
            to_pos = i;
            break;
        }
    }

    t = s.substring(from_pos, to_pos);
    //				alert(from_pos + ',' + to_pos + ',' + t+'.');
    return t;
}

function number_format(data)
{

    var tmp = '';
    var number = '';
    var cutlen = 3;
    var comma = ',';
    var i;

    var sign = data.match(/^[\+\-]/);
    if(sign) {
        data = data.replace(/^[\+\-]/, "");
    }

    len = data.length;
    mod = (len % cutlen);
    k = cutlen - mod;
    for (i=0; i<data.length; i++)
    {
        number = number + data.charAt(i);

        if (i < data.length - 1)
        {
            k++;
            if ((k % cutlen) == 0)
            {
                number = number + comma;
                k = 0;
            }
        }
    }

    if(sign != null)
        number = sign+number;

    return number;
}

function strpad(str, num, dir){
    str = str + '';
    if (str.length >= num)
        return str;
    var seed = new Array(num - str.length + 1).join('0');
    if (dir.toUpperCase() == 'LEFT')
        return seed + str;
    else
        return str + seed;
}

function lpad(str,num){
    return strpad(str, num, 'left');
}

function rpad(str,num){
    return strpad(str, num, 'right');
}

var callfunc = function(p){
    $.ajax({
          method   : "POST"
        , type     : "POST"
        , url      : "/callfunc"
        , cache    : false
        , dataType : "json"
        , async    : p.async
        , data     : { lib    : p.lib
                     , type   : (typeof p.type != 'undefined' && p.type) ? p.type : "model"
                     , method : p.method
                     , params : p.params
                     }
        })
        .fail(function () {
            alert("Ajax 함수 호출에 실패했습니다.");
        })
        .done(function (data) {
            if (!data.result) {
                if (p.failure) {
                    p.failure(data.message);
                } else if(data.message) {
                    alert(data.message);
                }
            }
            if (p.callback) {
                p.callback(data.output);
            }
        });
};
/**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }

(function(proxied) {
    window.alert = function() {
        //arguments[0] += " : test1818";
        if (event){
            event.preventDefault();
        }
        $.simpleDialog({
            title          : "Match Is On"
          , message        : arguments[0]
          , confirmBtnText : "OK"
          , closeButton    : false
        });
        return false;
        //return proxied.apply(this, arguments);
    };
})(window.alert);

window.alert_ex = function(message, callback)
{
    $.simpleDialog({
        title          : "Match Is On"
      , message        : arguments[0]
      , confirmBtnText : "OK"
      , closeButton    : false
      , onSuccess      : callback
    });
}

window.confirm_ex = function(message, onOk, onCancel, textTitle, textOk, textCancel)
{
    $.simpleDialog({
        title          : textTitle ? textTitle : "Match Is On"
      , message        : message
      , confirmBtnText : textOk ? textOk : "OK"
      , closeBtnText   : textCancel ? textCancel : "Cancel"
      , closeButton    : true
      , onSuccess      : onOk
      , onCancel       : onCancel
    });
}

window.history_back = function(){
    if (app_os == 'android' && typeof android.back != 'undefined') {
        android.back();
    } else if (!!window.webkit && typeof window.webkit.messageHandlers !== 'undefined') {
        window.webkit.messageHandlers.back.postMessage('');
    } else {
        history.back();
    }
}