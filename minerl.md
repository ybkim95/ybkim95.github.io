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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/item-4-minerl.png");
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
      <h1 style="font-size:40px; color:white; font-family:Arial;">MineRL : Training AI agents in Open World Environments</h1>
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
    <duration>June 2022 ~ Present</duration>
    <br>
    <organization> Software Capston Project,<br>Yonsei University </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              MineRL : Training AI agents in Open World Environments
            </div>
        </div>
        <br>
        <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
          <div align="left">
            Though deep reinforcement learning has led to breakthroughs in many difficult domains, these successes have required an ever-increasing number of samples. As state-ofthe-art reinforcement learning (RL) systems require an exponentially increasing number of samples, their development is restricted to a continually shrinking segment of the AI community. Likewise, many of these systemss cannot be applied to real-world problems, where environment samples are expensive. Resolution of these limitations requires new, sample-efficient methods. To facilitate research in this direction, we propose the MineRL Competition on Sample Efficient Reinforcement Learning using Human Priors [1].<br><br>
            <h6> Research Topics </h6>
            <rt>
              # robotics # human-computer interaction
            </rt>
            <br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <br>
            <center>
              <iframe width="840" height="480" src="https://www.youtube.com/embed/GHo8B4JMC38?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              <br>
             <img src="/assets/images/minerl_overview.png" width="80%" alt="aamas-1">
            </center>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Environment and Dataset
              </div>
            </div>
            <br>
            The task of the competition is solving the MineRLObtainDiamond-v0 environment. In this environment, the agent begins in a random starting location without any items, and is tasked with obtaining a diamond. This task can only be accomplished by navigating the complex item hierarchy of Minecraft.<br>
            The agent receives a high reward for obtaining a diamond as well as smaller, auxiliary rewards for obtaining prerequisite items. In addition to the main environment, we provide a number of auxiliary environments. These consist of tasks which are either subtasks of ObtainDiamond or other tasks within Minecraft.<br><br>
            <center>
              <img src="/assets/images/minerl_items.png" width="80%"><br><br>
            </center>
            A large-scale collection of over 60 million frames of human demonstrations were used, to utilized expert trajectories to minimize the algorithm’s interactions with the Minecraft simulator.
            <br><br><br>
             <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Model Architecture
              </div>
            </div>
            <br>
            <center>
              <img src="/assets/images/minerl_infogail.png" width="80%"><br><br>
            </center>
            <img src="/assets/images/minerl_model.png" alt="aamas-1">
            <br><br>
            The goal of imitation learning is to mimic expert behavior without access to an explicit reward signal. Expert demonstrations provided by humans, however, often show significant variability due to latent factors that are typically not explicitly modeled [2]. In this work, we utilized InfoGAIL algorithm in MineRL task to infer the latent structure of expert demonstrations in an unsupervised way. 
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Experiment and Result
              </div>
            </div><br>
            <center>
              <img src="/assets/images/minerl_model_summary.png" width="80%"><br>
              <img src="/assets/images/minerl_result.png" width="80%">
            </center><br>
            Above figure shows the model summary and four sub-steps to mine diamond. Although we also could not gain diamonds from the environment, we performed the best compared to the baselines previously used such as PPO, rule-based, naive BC. The future work should contain the evaluation process of how efficient the algorithm utilized the expert demonstrations and how can agents benefit from language instructions. 
            <!-- <img src="/assets/images/aamas-experiment.png" alt="aamas-1"> -->
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Reference
              </div>
            </div>
            <br>
            <p>
              <font size="3">
              <a href="/about/about_team.htm">[1] William H. Guss and Codel, Cayden and Hofmann, Katja and Houghton, Brandon and Kuno, Noboru and Milani, Stephanie and Mohanty, Sharada and Liebana, Diego Perez and Salakhutdinov, Ruslan and Topin, Nicholay and others, "The MineRL Competition on Sample Efficient Reinforcement Learning using Human Priors" at NeurIPS Competition Track.</a><br>
              <a href="/about/about_team.htm">[2] Yunzhu Li, Jiaming Song, and Stefano Ermon, "Inferring The Latent Structure of Human Decision-Making from Raw Visual Inputs." at NeurIPS.</a>
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

