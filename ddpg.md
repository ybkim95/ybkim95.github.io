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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/item-6-ddpg.png");
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
      <h1 style="font-size:40px; color:white; font-family:Arial;">Training Self-Driving Car using DDPG Algorithm</h1>
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
    <duration>Sep 2018 ~ Dec 2018</duration>
    <br>
    <organization> MLCS Lab, Yonsei University </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Training Self-Driving Car using Deep Deterministic Policy Gradient (DDPG) Algorithm
            </div>
        </div>
        <br>
        <div style="max-width:900px; word-wrap:break-word; font-size:20px;">
          <div align="left">
            <br>
            <h6> Research Topics </h6>
            <rt>
              # deep reinforcement learning # simulation environment
            </rt>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <br>
            <!-- <img src="/assets/images/aamas_1.png" alt="aamas-1"> -->
            <iframe width="960" height="480" src="https://www.youtube.com/embed/NaZAxuvrqEE?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <br>
            <br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
              <div align="left">
                Deep Reinforcement Learning (DRL) based algorithms have been recently used to solve Markov Decision Processes (MDPs), where the scope of the algorithm is to calculate the optimal policy of an agent to choose actions in an environment with the goal of maximize a reward function, obtaining quite successful results in fields like solving computer games or simple decision-making system [1]. <br>The discrete nature of DQN is not well studied ongoing problem like self-driving, due to the infinite possibles of movement the car in each step. Studying DQN and the obtained results, we will analyze the limitations of this method for this navigation purpose. On the other hand, the <b>DDPG</b> algorithm has a continuous nature that fits better to autonomous driving task.<br>
                In this work, we implement DDPG algorithm to train an agent in V-REP (nowadays called Coppelia Sim) simulator which involves physics engine and evaluate the performance of trained self-driving car. 
              </div>
            </div>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Methods
              </div><br>
              <center>
                <img src="/assets/images/ddpg_method.png" style="width: 70%">
              </center><br>
            </div>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
              <div align="left">
                To control the simulated vehicle, we used Ackermann Steering and we defined <b>2-dimensional</b> action space where action[0] is the speed and action[1] is the steering angle. For observation space, we defined it on <b>27-dimensional</b> space where 24-dimensions are the LiDAR array and the rest four are relative angle towards the center road line, v_x and v_y. We had many trial and error and defined the <b>reward function</b> as below:<br><br>
                <center>
                  <img src="/assets/images/reward_function.png" style="width: 25%">
                </center><br>
                (where f(speed_x) is the magnitude of speed in x-direction according to the center road line and f(LiDAR) is sum of lidar rewards on front, side, and back which are defined with the empirical thresholds)<br>
                To prevent from getting overfitted, we randomly positioned an agent in random positions and random direction angles (In the later work, we also generated random tracks for each iteraction).  
              </div>
            </div>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Experiment and Result
              </div>
            </div>
            <br>
            <img src="/assets/images/ddpg_experiment.png" alt="aamas-1">
            <br>
            <br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
              <div align="left">
                In this work, since the simulator involved high-quality physics engine, it took few days to train an agent and due to this reason, we disabled the graphics during the training.<br> 
                Every episode was terminated whenever the vehicle 1) collides with the environment, 2) go backward direction. For the first 50 episodes, agent showed totally random movements, but after 200 episodes, the agent started to behave well and show reasonable performance. Exploration was also an important factor when training an agent. In DDPG, we utilize Ornstein-Ulenbeck(OU) noise and add this to the output action (I empirically controlled this value within the boundary from -0.3 to 0.3).<br>
                Future work should involve more realistic environment with multiple agents at a same time.
              </div>
            </div>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                References
              </div>
            </div>
            <br>
            <p>
              <font size="3">
                <a href="https://link.springer.com/article/10.1007/s11042-021-11437-3">[1] Pérez-Gil, Ó., Barea, R., López-Guillén, E., Bergasa, L. M., Gómez-Huélamo, C., Gutiérrez, R., & Díaz-Díaz, A. (2022). Deep reinforcement learning based control for autonomous vehicles in carla. Multimedia Tools and Applications, 81(3), 3553-3576.</a><br>
                <a href="https://github.com/Hong123123/DDPG_VREP">[2] https://github.com/Hong123123/DDPG_VREP</a><br>
                <a href="https://arxiv.org/abs/1509.02971">[3] Lillicrap, T. P., Hunt, J. J., Pritzel, A., Heess, N., Erez, T., Tassa, Y., ... & Wierstra, D. (2015). Continuous control with deep reinforcement learning. arXiv preprint arXiv:1509.02971.</a><br>
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


