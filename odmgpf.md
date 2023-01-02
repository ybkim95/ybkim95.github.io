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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/item-5-odmgpf.png");
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
      <h1 style="font-size:40px; color:white; font-family:Arial;">Obstacle-dependent Mixed Gaussian Potential Field (ODMG-PF)</h1>
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
    <br>
    <duration>Jan 2020 ~ July 2020</duration>
    <br>
    <organization> Graduate Thesis, Yonsei University </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              A Real-time Dynamic Obstacle Avoidance of Holonomic Mobile Robot using an Obstacle-Driven Mixed Gaussian Potential Field
            </div>
        </div>
        <br>
        <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
          <div align="left">
            A new obstacle avoidance method for autonomous vehicles called obstacle-dependent Mixed Gaussian potential feld (ODMG-PF) was designed and implemented. It detects obstacles and calculates the likelihood of collision with them. In this paper, we present a novel attractive feld and repulsive feld calculation method and direction decision approach. Simulations and the experiments were carried out and compare<br><br>
            <h6> Research Topics </h6>
            <rt>
              # robotics # obstacle avoidance # navigation
            </rt>
            <br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <br>
            <center>
              <img src="/assets/images/odmgpf_1.png" width="80%" alt="aamas-1"><br>
            </center>
            Obstacle avoidance is one of the essential technologies in local path planning and one of the critical technologies that guarantees human and vehicle safety. Many kinds of sensors are used to detect obstacles such as sonar, laser range finder, LIDAR, stereo vision, and 3D depth sensor [1]. In this study, we used a laser range finder and introduced a new method to avoid obstacles that we call the Obstacle-Driven Mixed Gaussian Potential Field (ODMG-PF) method.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Methods
              </div>
            </div>
            <br>
            <img src="/assets/images/odmgpf_2.png" alt="aamas-1"><br><br>
            The main idea behind this method is that, after receiving distance data from the LiDAR sensor, we consider only the objects that are within the threshold range, enlarge the obstacles with regard to the robot’s width, and construct a Gaussian (repulsive) potential field from them. Next, we calculate the mixed gaussian attractive field from the yaw angle information from an inertial measurement unit (IMU). The total field is made of these two fields, and, from it, we choose the angle with the minimum total field value.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Experiments
              </div>
            </div>
            <br>
            <img src="/assets/images/odmgpf_3.png" alt="aamas-1"><br><br>
            The experiment was carried out in simulation (V-REP) environment first and then tested in the real-world environment. In order to communicate with the robot, I used Robot Operating System (ROS) melodic in Ubuntu 18.04 LTS OS. For mobile robot, I customized a turtlebot from Robotiz by replacing the normal wheels to Mecanum-wheels. To obtain the ground truth data as possible, I placed the robot and the obstacles at a fixed initial positions and calculated the change of it's positions by analyzing the videos recorded. 
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Results
              </div>
            </div>
            <br>
            <img src="/assets/images/odmgpf_4.png" width="100%"><br><br>
            I evaluated the obstacle-avoidance capability with mobile robots and found my algorithm, ODMG-PF, successfully decreased the collision rate by <b>17.2%</b> and <b>14.3%</b> in the simulation and real-world, respectively, compared to the baseline. 
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                References
              </div>
            </div>
            <br>
            <p>
              <!-- <a href="https://ybkim95.notion.site/Real-time-Dynamic-Obstacle-Avoidance-of-Holonomic-Mobile-Robot-using-an-Obstacle-Driven-Mixed-Gaussi-af943fa814194e639ba19cdfabe2cb1b">[2] A Real-time Dynamic Obstacle Avoidance of Holonomic Mobile Robot using an Obstacle-Driven Mixed Gaussian Potential Field (2020)</a> -->
              <a href="https://www.hindawi.com/journals/jat/2018/5041401/">[1] Cho, J. H., Pae, D. S., Lim, M. T., & Kang, T. K. (2018). A real-time obstacle avoidance method for autonomous vehicles using an obstacle-dependent Gaussian potential field. Journal of Advanced Transportation, 2018.</a>
              <font size="3">
              <!-- <a href="/about/about_team.htm">Explainable Representations of Human Interaction: Engagement Recognition model with Video Augmentation.<br>Y.B.KIM, S.M.Algohwinem, H.W.Park, "Explainable Representations of Human Interaction: Engagement Recognition model with Video Augmentation." accepted in Human-Centered AI Workshop at NeurIPS.</a><br><br>
              <a href="/about/about_team.htm">Explainable Representations of Human Interaction: Engagement Recognition model with Video Augmentation.<br>Y.B.KIM, H.Chen, S.M.Algohwinem, C.Breazeal, H.W.Park, "Joint Engagement Classification using Video Augmentation Techniques for Multi-person Human-robot Interaction." under review at AAMAS 2023.</a> -->
              </font>
            </p>
          </div>
        </div>
    </center>
    <br>
    <br>
    <br>
    <br>
    

</section>
</body>


