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
*{
  padding: 0;
  margin: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}
body{
  font-family: montserrat;
}
nav{
  /* background-color: white; */
  background-color: rgba(210, 210, 210, 0.99);
  /* opacity: 0.99; */
  /* background: #0082e6; */
  height: 80px;
  width: 100%;
}
label.logo{
  background-image: url('/assets/image/ybk.jpg');
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
<head>
<meta charset="utf-8">
<title>Responsive Navbar | CodingNepal</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
</head>
<body>
<nav>
    <!-- <input type="checkbox" id="check"> -->
    <!-- <label class="logo"> -->
        <!-- <img src="/assets/images/ybk_logo_white.png" style="width:8%;height:8%" alt="logo"> -->
    <!-- </label> -->
    <input type="image" src="/assets/images/ybk_logo_white.png" style="height:90%" />
    <ul>
        <li><a class="active" href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <!-- <li><a href="#">Contact</a></li> -->
        <!-- <li><a href="#">Feedback</a></li> -->
    </ul>
</nav>
<section>
    <br>
    <br>
    <center>
        <h3>
            Multi-Party Human-Robot Conversation Interactions
        </h3>
        <div style="max-width:900px; word-wrap:break-word; font-size:20px;">
            With the emergence of social robots in people’s daily lives, their interactions with people need to consider not only engaging with individuals, but also with a group of people (e.g. families or colleagues). However, most human-robot interaction work has focused on interacting with a single user at a time, due to challenges in understanding social cues from multiple people at the same time as well as designing interactions with a group of people. Designing for group interactions is vastly different from designing interaction with individuals. Because in a group interaction users are also interacting with each other and not just with the robot, understanding engagement cues require deeper contextualized interpretation, for example. Not only that, conversing with multiple users at the same time requires both significant advancements in sensor technology and dialogue systems. Conversation is central to interactions including in a museum guide setting that this project is targeting. In this project, we aim to design contextualized and personalized conversation experience between…
        </div>
    </center>
</section>

</body>
