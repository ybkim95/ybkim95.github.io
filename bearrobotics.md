---
layout: page
title: Play
# description: Lorem ipsum dolor est
image: assets/images/ice_hockey.png
# nav-menu: true
---

<!-- Main -->
<div id="main">

<!-- <meta name="viewport" content="width=device-width, initial-scale=1"> -->
<!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> -->
<style>
  .hero-image {
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/bear_cover.png");
    height: 60%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
  }
  .hero-text {
    text-align: left;
    position: absolute;
    top: 70%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
  }
  .hero-text button {
    border: none;
    outline: 0;
    display: inline-block;
    padding: 10px 25px;
    color: black;
    background-color: #ddd;
    text-align: center;
    cursor: pointer;
  }
  .hero-text button:hover {
    background-color: #555;
    color: white;
  }
*{
  padding: 0;
  margin: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}
body{
  font-family: Arial;
}
nav{
  /* background-color: white; */
  background-color: rgba(255, 255, 255, 0.4);
  opacity: 0.99;
  /* background: #0082e6; */
  height: 80px;
  width: 100%;
}
label.logo{
  background-image: url('/assets/image/ybk.jpg');
  opacity: 0.97;
  /* color: black;
  font-size: 35px;
  line-height: 80px;
  padding: 0 100px;
  font-weight: bold; */
}
nav ul{
  /* background-color: gray; */
  float: right;
  margin-right: 20px;
}
nav ul li{
  display: inline-block;
  line-height: 80px;
  margin: 0 5px;
}
nav ul li a{
  color: black;
  font-size: 17px;
  padding: 0px 13px;
  border-radius: 3px;
  text-transform: uppercase;
}
/* a.active,a:hover{
  background: #1b9bff;
  transition: .5s;
} */
.checkbtn{
  font-size: 30px;
  color: white;
  float: right;
  line-height: 80px;
  margin-right: 40px;
  cursor: pointer;
  display: none;
}
#check{
  display: none;
}
@media (max-width: 952px){
  label.logo{
    font-size: 30px;
    padding-left: 50px;
  }
  nav ul li a{
    font-size: 16px;
  }
}
@media (max-width: 858px){
  .checkbtn{
    display: block;
  }
  ul{
    position: fixed;
    width: 100%;
    /* height: 100vh; */
    background: #2c3e50;
    /* top: 80px; */
    left: -100%;
    text-align: center;
    transition: all .5s;
  }
  nav ul li{
    display: block;
    margin: 50px 0;
    line-height: 30px;
  }
  nav ul li a{
    font-size: 20px;
  }
  a:hover,a.active{
    /* background: none; */
    color: #0082e6;
  }
  #check:checked ~ ul{
    left: 0;
  }
}
section{
  /* background: url(bg1.jpg) no-repeat; */
  /* background-size: cover; */
  background-color: white;
  height: calc(100vh - 80px);
}
</style>
<style type='text/css'>
  h1, h2, h3, h4, h5 {
      font-family: Arial;
      /* color: maroon; */
      /* border-bottom: 1px solid rgb(200, 200, 200); */
  }
  h6 {
    font-family: Arial;
    color: gray;
  }
  rt {
    font-family: Arial;
    color: gray;
    font-size: 16px;
  }
</style>
<style>
.btn {
  outline: none;
  border: none;
  font-size: 16px;
  /* cursor: pointer; */
  /* display: inline-block; */
}
/* .btn:hover {background: #eee;} */
.success {color: black;}
/* .info {color: dodgerblue;}
.warning {color: orange;}
.danger {color: red;}
.default {color: black;} */

projectbutton {
    position:absolute;
    top: 67%;
    padding-left: 3%;
    font-family: Arial;
    font-weight: bold;
    font-size: 20px;
    color: black;
    background-color: transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
    outline: none;
}

duration {
    position:absolute;
    top: 75%;
    padding-left: 4%;
    font-family: Arial;
    font-size: 15px;
    color: gray;
    background-color: transparent;
    /* background-repeat: no-repeat; */
    /* border: none; */
    /* cursor: pointer; */
    /* overflow: hidden; */
    /* outline: none; */
}

organization {
    position:absolute;
    top: 79%;
    padding-left: 4%;
    font-family: Arial;
    font-size: 15px;
    color: gray;
    background-color: transparent;
    /* background-repeat: no-repeat; */
    /* border: none; */
    /* cursor: pointer; */
    /* overflow: hidden; */
    /* outline: none; */
}
</style>

<head>
  <meta charset="utf-8">
  <title>Responsive Navbar | CodingNepal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
</head>
<body>
<section>
  <div class="hero-image">
    <div class="hero-text">
      <h1 style="font-size:40px; color:white; font-family:Arial;">Development of Indoor Serving Robot, <i>Servi</i></h1>
    </div>
    <nav>
      <input onClick="window.location.href='../'" type="image" src="/assets/images/white_logo.png" style="height:90%" />
        <ul>
            <!-- <li><a class="active" href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li> 
            <li><a href="#">Contact</a></li> 
            <li><a href="#">Feedback</a></li> -->
        </ul>
    </nav>
  </div>
    <br>
    <projectbutton><a href="../#sec_project">< Projects</a></projectbutton>
    <!-- <br> -->
    <!-- <duration>Dec 2021 ~ Mar 2022</duration> -->
    <br>
    <duration>Mar 2019 ~ Aug 2019</duration>
    <br>
    <organization> Bear Robotics, Redwood City, CA </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Development of Indoor Serving Robot, <i>Servi</i>
            </div>
        </div>
        <br>
        <img src="/assets/images/penny_task.png" alt="tdrc-1" style="width:30%;"><br>
        <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
          <div align="left">
            Bear Robotics is elevating dining experiences by automating the hard part. By utilizing AI and autonomous robot technology, Bear Robotics deploys robots to take care of everything from drink serving to food running and table bussing, allowing hosts, servers and wait staff to focus on delivering outstanding service.<br><br>
            <h6> Research Topics </h6>
            <rt>
              # robotics # human-robot interaction # SLAM
            </rt>
            <br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <br>
            <!-- <img src="/assets/images/aamas_1.png" alt="aamas-1"> -->
            <iframe width="840" height="480" src="https://www.youtube.com/embed/G2bimZ5hBBc?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Servi
              </div>
            </div>
            <br>
            <center>
              <img src="/assets/images/servi_product.png" style="width: 90%"><br>
              <img src="/assets/images/servi_product2.png" style="width: 100%">
            </center><br>
            Here are the several effects that Servi can bring :<br><br>
            <b> 1. Enhancing service</b><br>
            - Spending more time creating exceptional experience<br>
            - Cover more tables and earn more tips<br> 
            - Eliminate burnout for better service<br>
            <br>
            <b> 2. Smarter, Safer, Stronger</b><br>
            - Self-driving with a variety of service modes<br>
            - NSF-certified<br> 
            - Carry capacity up to 66lbs<br>
            <br>
            <b> 3. Alleviating headaches</b><br>
            - Combat javor shortage<br>
            - Reduce turnover<br> 
            - Less admin overhead<br>
            <br>
            <b> 4. A Top-Rate Time Card</b><br>
            - Less than $2.75 per hour<br>
            - 12 hours on on a single charge<br> 
            - 7 days a week / 365 days a year<br>
            <br>
            <!-- <img src="/assets/images/aamas-experiment.png" alt="aamas-1"> -->
            <br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Projects
              </div>
            </div><br>
            <center>
              <img src="/assets/images/servi_testing.png" style="width: 70%">
            </center><br>
            It is important for mobile robots to navigate safely in indoor space. To do so, Simultaneous Localization and Mapping (SLAM) technology is one of the essential skills that robot must have. There are many challenges on implementing SLAM to mobile robots in the wild and the problems that I wanted to solve were 1) How can robots accurately localize themselves in open space, 2) How can robots trade-off between the accurate mapping and the computational cost in real-time.<br>
            Along with those questions, I also focused on assuring the robot performance by testing the main sensors (e.g., LiDAR, Camera, etc) in the robot and evaluate the quality of each sensor by conducting unit tests. 
            <br>
          </div>
        </div>
    </center>
    <br>
    <br>
    <br>
    <br>
    

</section>
</body>


