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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/item-2-elder-care.png");
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
      <h1 style="font-size:40px; color:white; font-family:Arial;">Conversational AI agents for Elder Care</h1>
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
    <duration>Nov 2022 ~ Present</duration>
    <br>
    <organization> Personal Robots Group,<br>MIT Media Lab </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Conversational AI agents for Emotional Wellness and Medication Adherence
            </div>
        </div>
        <br>
        <img src="/assets/images/fitbit_overview1.png" style="width:35%;"><br>
        <img src="/assets/images/fitbit_overview2.png" style="width:30%;"><br>
        <div style="max-width:900px; word-wrap:break-word; font-size:20px;">
          <div align="left"><br>
            The emotional wellness of individuals emphasizes the importance of a positive outlook towards life circumstances, the capability to cope with stress and ability to maintain fulfilling relationships with others. However, the digital intervention to improve the emotional wellness of older adults is still an underexplored area [1].<br><br>
            In this project, we develop a system that integrates Fitbit data with a conversational agent to support elderly's emotional wellness. This framework is to help caregivers of elderly and our aim is to enhance the user experience by providing quantitative emotional wellness-related data (e.g., sleep, mood, stress, etc). Fitbit data could help users better reflect on their current behaviors and the effectiveness of the intervention [2].<br><br><br>
            <h6> Research Topics </h6>
            <rt>
              # elder-care # emotional-wellness # medication adherence
            </rt>
            <br><br>
            <!-- <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div> -->
            <!-- <br><br><br> -->
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Fitbit
              </div>
            </div><br>
            <center>
              <img src="/assets/images/fitbit_charge5.png" style="width:35%;"><br>
            </center>
            <div style="max-width:900px; word-wrap:break-word; font-size:20px;">
              <div align="left"><br>
              In our study, we use Fitbit Charge5 as an interface to collect user data and use Python implemented Fitbit API to utilize and feed the data into the conversational model (chatbot). From creating Fitbit account to API authorization, please refer to <b><a href="https://towardsdatascience.com/using-the-fitbit-web-api-with-python-f29f119621ea">here</a></b>.<br>
              Once the set-up process is done, we can now refer to <b><a href="https://python-fitbit.readthedocs.io/en/latest/">here</a></b> to utilize all the sensor data gathered from user activity and below is an example user sleep data printed in the terminal:<br><br>
              <center>
                <img src="/assets/images/fitbit_sleep.png" style="width:70%;"><br>
              </center>
              </div>
            </div>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Conversational model and Dataset
              </div>
            </div><br>
            TBA
            <br><br><br>
            <!-- <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Experiments
              </div>
            </div> -->
            <!-- <br>
            <br><br><br> -->
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                References
              </div>
            </div>
            <br>
            <p>
              <font size="3">
              <a href="https://aisel.aisnet.org/cgi/viewcontent.cgi?article=1035&context=bled2018">[1] Warraich, M. U., Rauf, I., & Sell, A. (2018). Co-creation Model to Design Wearables for Emotional Wellness of Elderly. In Bled eConference (p. 6).</a><br>
              </font>
              <font size="3">
              <a href="https://github.com/wmerians/FitBit-Data-Collection-and-Visualization-System">[2] https://github.com/wmerians/FitBit-Data-Collection-and-Visualization-System</a><br>
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


