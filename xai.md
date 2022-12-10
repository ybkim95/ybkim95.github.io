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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/item-1-hcai.png");
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
      <h1 style="font-size:40px; color:white; font-family:Arial;">Explainable Human-Robot Interaction Learning with Video Augmentation Techniques</h1>
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
    <organization> Personal Robots Group, MIT Media Lab </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Multi-Party Human-Robot Conversation Interactions
            </div>
        </div>
        <br>
        <div style="max-width:900px; word-wrap:break-word; font-size:20px;">
          <div align="left">
            Affect understanding capability is essential for social robots to autonomously interact with a group of users in an intuitive and reciprocal way. In this work, we use a dataset of parent-child dyads reading storybooks together with a social robot at home. We first train RGB frame- and skeleton-based joint engagement recognition models with four video augmentation techniques (<i>General Aug</i>, DeepFake, CutOut, and Mixed) applied datasets to improve joint engagement classification performance. Second, we demonstrate experimental results on the use of trained models in the robot-parent-child interaction context. Third, we introduce a behavior-based metric for evaluating the learned representation of the models to investigate the model interpretability when recognizing joint engagement. This work serves as the first step toward fully unlocking the potential of end-to-end video understanding models pre-trained on large public datasets and augmented with data augmentation and visualization techniques for affect recognition in the multi-person human-robot interaction in the wild.<br><br>
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
            <img src="/assets/images/aamas_1.png" alt="aamas-1"><br><br>
            We propose a framework for evaluating the learned representation (Grad-CAM) with modified Optical Flow and skeleton information combined Semantic Segmentation as references. With the fine-tuned models (on publicly available dataset such as Kinetics-400), we generate Grad-CAM for each video clip and evaluate its quality. We calculate the evaluation score based on two sub-scores (semantic-based and motion-based) which are obtained by applying mutual information and cross-entropy.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Dataset
              </div>
            </div>
            A social robot was deployed and teleoperated remotely in the homes of 12 families with 3-7-year-old children to engage in a triadic story-reading activity with the parent and child over the course of six 25-minute sessions and 3 to 6 weeks in total. For each triadic session, audiovisual recordings were captured and subsequently used to annotate the quality of parent-child engagement. We chose the Joint Engagement Rating Inventory (JERI) to measure parent-child engagement [1], as it has been utilized and validated in previous parent-child interaction studies [1, 4]. <br>
            Using the intra-class correlation (ICC) type (3,1) for average fixed raters, the agreement among the three annotators was measured. Given these evaluation criteria, the annotation quality with ICC=0.95 exceeded the threshold for very good quality (0.75 ≤ 𝐼𝐶𝐶 ≤ 1.0). After recordings were independently coded by the annotators, the final score for each recording fragment was determined by averaging the ratings assigned to each scale by the two annotators. We convert the 5-scale into three classification levels (low: 8.49%, medium: 49.68%, and high: 41.83%) for model training and testing. Strictly following the annotation protocol in [4], we annotated 16,606 five-second video clips with 1517.08 ± 309.34 fragments from each family on average.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Video Augmentation
              </div>
            </div>
            <br>
            <b>Baseline </b> To ensure a fair comparison with the proposed video augmentations techniques, we apply oversampling to the original dataset which duplicated 8,143 video clips from low and high joint engagement labeled video clips to make all the labels have the same ratio. <br>
            <b>General Aug </b> This technique is applied to diversify the background (replace the background with RGB color, random indoor image, and blur the background), encouraging the model’s robust learning by adding noise to the whole frame, randomly rotating an image, applying horizontal flipping, and lastly, giving hints of semantics in the frame by applying semantic segmentations. <br>
            <b>DeepFake </b> DeepFake was applied for dyads’ faces to overcome the small populations in the original dataset and also for debiasing purposes. We used SimSwap [8] for multi-person face swapping in videos. To feed a diverse set of target face images, we also utilized AI-generated face dataset (https://generated.photos/faces) which supports realistic customizations (e.g., race, gender, age, accessories, and hair type). This generates quite natural video clips according to its target face images. <br>
            <b>Mixed </b> We also wanted to see if combining the datasets that showed performance improvement individually would make even more performance improvements once combined. To do this, we randomly sampled video clips from both General Aug and DeepFake while keeping the same ratio from each dataset. So in total, we kept 24,749 video clips for Mixed.<br>
            <b>CutOut </b> CutOut is a well-known but simple regularization technique that randomly masks out square regions of input during training (spatial prior dropout in input space) [ 13 ]. This can be used to improve the robustness and overall performance when conducting classification tasks, and in this work, CutOut is used to validate the model’s representation learning without the core information in the scenes (i.e. face). To apply CutOut, we utilized the face detection module to detect the parent’s and child’s faces and cut out the corresponding regions, which are then replaced by black boxes. In total, we gathered 24,749 video clips by oversampling towards the largest number of labels (Mid, 𝑁 =8,249) in the dataset.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Experiments
              </div>
            </div>
            <br>
            <img src="/assets/images/aamas-experiment.png" alt="aamas-1">
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Methods
              </div>
            </div>
            <img src="/assets/images/xai_methods.png" alt="aamas-1">
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Visualization
              </div>
            </div>
            <img src="/assets/images/xai_visualization.png" alt="aamas-1">
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Publications
              </div>
            </div>
            <br>
            <p>
              <font size="3">
              <a href="/about/about_team.htm">[1] Y.B.KIM, S.M.Algohwinem, H.W.Park, "Explainable Representations of Human Interaction: Engagement Recognition model with Video Augmentation." accepted in Human-Centered AI Workshop at NeurIPS.</a><br><br>
              <a href="/about/about_team.htm">[2] Y.B.KIM, H.Chen, S.M.Algohwinem, C.Breazeal, H.W.Park, "Joint Engagement Classification using Video Augmentation Techniques for Multi-person Human-robot Interaction." under review at AAMAS 2023.</a>
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


