---
# layout: page
title: About Me
image: assets/images/cafe.png
# nav-menu: true
---

<!-- Main -->
<div id="main" class="alt">

<!-- One -->
<section id="one">
	<div class="inner">
		<header class="major">
		</header>
<html>
    <head>
        <meta charset="utf-8">   
        <link rel="stylesheet" href="/assets/css/gallery.css">
        <script>
            body {
                background-color: rgb(0,0,0);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
                    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                }
                #chartdiv {
                    width: 100%;
                    height: 97vh;
                }
        </script>
    </head>
    <body style="background-color:rgb(255,255,255);"> 
        <a href="/"><img src="assets/images/ybk_logo_white.png" style="width:5.5%;"></a>
        <br>
        <br>
        <center>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
                What global problems are we facing?.<br>Please click <a href="#" onclick="javascript:menuSelections(1)">Population Map</a> to see the detailed visualization.
            </div>
        </center>
        <br>
        <br>
        <br>
        <script src="//www.amcharts.com/lib/4/core.js"></script>
        <script src="//www.amcharts.com/lib/4/maps.js"></script>
        <script src="//www.amcharts.com/lib/4/themes/animated.js"></script>
        <script src="//www.amcharts.com/lib/4/geodata/worldLow.js"></script>
        <script src="//www.amcharts.com/lib/4/geodata/worldHigh.js"></script>
        <script src="//www.amcharts.com/lib/4/geodata/worldUltra.js"></script>
        <div id="chartdiv"></div>
        <div id="info"></div>
        <script src = "/assets/js/world_population.js" type = "text/javascript"></script>
        <br>
    </body>
</html>