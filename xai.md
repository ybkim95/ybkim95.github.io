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
u {
  text-decoration: underline;
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
    <organization> Personal Robots Group,<br>MIT Media Lab </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Multi-Party Human-Robot Conversation Interactions
            </div>
        </div>
        <br>
        <img src="/assets/images/xai_jibo.png" alt="aamas-1" style="width:40%;"><br>
        <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
          <div align="left">
            Affect understanding capability is essential for social robots to autonomously interact with a group of users in an intuitive and reciprocal way.<br>In this work, we use a dataset (namely Triadic) of parent-child dyads reading storybooks together with a social robot at home. <b>First</b>, we train 1) RGB frame- and 2) skeleton- based joint engagement recognition models with four video augmentation techniques (<i>General Aug</i>, <i>DeepFake</i>, <i>CutOut</i>, and <i>Mixed</i>) applied datasets to improve joint engagement classification performance. <b>Second</b>, we demonstrate experimental results on the use of trained models in the robot-parent-child interaction context. <b>Third</b>, we introduce a behavior-based metric for evaluating the learned representation of the models to investigate the model interpretability when recognizing parent-child joint engagement.<br>This work serves as the first step toward fully unlocking the potential of end-to-end video understanding models pre-trained on large public datasets augmented with feature aplified augmentation and visualization techniques for affect recognition in the multi-person human-robot interaction in the wild.<br><br>
            <h6> Research Topics </h6>
            <rt>
              # affect recognition # human-robot interaction # robot in the wild
            </rt>
            <br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <img src="/assets/images/aamas_1.png" alt="aamas-1"><br>
            We propose a framework for evaluating the learned representation (<a href="https://arxiv.org/abs/1610.02391?source=post_page---------------------------">Grad-CAM</a>) with modified Optical Flow and skeleton information combined Semantic Segmentation as two references. With the fine-tuned models (on publicly available dataset such as Kinetics-400), we generate Grad-CAM inference for each video clip and evaluate its quality by calculating the score. We calculate the evaluation score based on two sub-scores (1) semantic-based and 2) motion-based) which are obtained by applying mutual information and cross-entropy.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Dataset
              </div>
            </div>
            A social robot was deployed and teleoperated remotely in the homes of 12 families with 3-7-year-old children to engage in a triadic story-reading activity with the parent and child over the course of six 25-minute sessions and 3 to 6 weeks in total. For each triadic session, audiovisual recordings were captured and subsequently used to annotate the quality of parent-child engagement. We chose the <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3445743/">Joint Engagement Rating Inventory (JERI) [1]</a> to measure parent-child engagement, as it has been utilized and validated in <a href="https://ieeexplore.ieee.org/document/9784429">previous parent-child interaction studies [1, 4]</a>. <br>
            Using the intra-class correlation (ICC) type (3,1) for average fixed raters, the agreement among the three annotators was measured. Given these evaluation criteria, the annotation quality with ICC=0.95 exceeded the threshold for very good quality (0.75 ≤ 𝐼𝐶𝐶 ≤ 1.0). After recordings were independently coded by the annotators, the final score for each recording fragment was determined by averaging the ratings assigned to each scale by the two annotators. We convert the 5-scale into <b>three</b> classification levels (<b>Low</b>: 8.49%, <b>Medium</b>: 49.68%, and <b>High</b>: 41.83%) for model training and testing. Strictly following the annotation protocol in <a href="https://ieeexplore.ieee.org/document/9784429">[4]</a>, we annotated 16,606 five-second video clips with 1517.08 ± 309.34 fragments from each family on average.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Video Augmentation
              </div>
            </div>
            <br>
            <b>General Aug </b> This technique is applied to diversify the background (replace the background with RGB color, random indoor image, and blur the background), encouraging the model’s robust learning by adding noise to the whole frame, randomly rotating an image, applying horizontal flipping, and lastly, giving hints of semantics in the frame by applying semantic segmentations. <br>
            <b>DeepFake </b> DeepFake was applied for dyads’ faces to overcome the small populations in the original dataset and also for debiasing purposes. We used <a href="https://arxiv.org/abs/2106.06340">SimSwap [8]</a> for multi-person face swapping in videos. To feed a diverse set of target face images, we also utilized AI-generated face dataset (<a href="https://generated.photos/faces"><u>https://generated.photos/faces</u></a>) which supports realistic customizations (e.g., race, gender, age, accessories, and hair type). <br>
            <b>Mixed </b> We also wanted to see if combining the datasets that showed performance improvement individually would make even more performance improvements once combined. To do this, we randomly sampled video clips from both General Aug and DeepFake while keeping the same ratio from each dataset. <br>
            <b>CutOut </b> <a href="https://arxiv.org/abs/1708.04552">CutOut</a> is a well-known but simple regularization technique that randomly masks out square regions of input during training (spatial prior dropout in input space). This can be used to improve the robustness and overall performance when conducting classification tasks, and in this work, CutOut is used to validate the model’s representation learning without the core information in the scenes (i.e. face).
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Methods
              </div>
            </div>
            <img src="/assets/images/xai_methods.png" alt="aamas-1"><br>
            <h5>1. RGB frame-based models </h5>
            <b> 1-1) TimeSformer</b> is only built on self-attention over space and time. It adapts the Transformer architecture to video by enabling spatiotemporal feature learning directly from a sequence of frame-level patches.<br>
            <b> 1-2) X3D </b> is a family of efficient video networks that continuously expand a small 2D image classification architecture along multiple network axes (space, time, width, and depth). <br>
            <b> 1-3) I3D </b> is a 2D ConvNet inflation-based model, in which the filters and pooling kernels of deep image classification ConvNets are expanded into 3D. <br>
            <b> 1-4) SlowFast </b> proposes a dual-pathway structure to combine the benefits of a slow pathway for static spatial features and a fast pathway for dynamic motion features <br><br>
            <h5>2. Skeleton-based models </h5>
            <b> 2-1) CTR-GCN </b> proposes Channel-wise Topology Refinement Graph Convolution Network dynamically learns different topologies and effectively aggregates joint features in different channels. <br>
            <b> 2-2) MS-G3D </b> (multi-Scale aggregation Scheme) disentangles the importance of nodes in different neighborhoods for effective long-range modeling.  <br>
            <b> 2-3) ST-GCN & ST-GCN++ </b> adopts Graph Convolution Neural (GCN) Networks for skeleton processing. <br><br>
            <h5>3. Image-matching metrics </h5> First, we adopt <b>mutual information</b>, a dimensionless quantity metric that measures the mutual dependence between two variables. The metric is high when the attention map signal is highly concentrated in a few histogram bins, and low when the signal is spread across many bins. Here, we convert the image into a distribution by flattening the image arrays and then compute the bi-dimensional histogram of two image array samples. <br>The second metric is <b>cross-entropy</b>, which comes from the Kullback-Leibler divergence. This is a widely used metric for calculating the difference between two distributions. Here, we first normalize the pixel values in images and then pass this through log-softmax to convert images into distributions. Then we apply cross-entropy. Given that we have all the bounding boxes for each parent’s and child’s face and body, we could separate these values based on their bounding box coordinates.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Experiments
              </div>
            </div>
            <br>
            <img src="/assets/images/aamas-experiment.png" alt="aamas-1"><br>
            We conduct experiments to evaluate the effectiveness of the proposed video augmentation techniques; General Aug, DeepFake, Mixed, and CutOut to see their capability to improve joint engagement recognition on state-of-the-art action recognition models. Also, we compare the joint engagement classification performance between RGB frame-based and skeleton-based models to see the effect of different inputs in this task. For the implementation, we utilized MMAction2 and Pyskl, an open-source toolbox for video understanding based on PyTorch and all of the models were trained on 8 NVIDIA 1080Ti GPUs.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Visualization
              </div>
            </div><br>
            <center>
              <img src="/assets/images/xai_visualization.png" alt="aamas-1" style="width:70%;"><br><br>
            </center>
            <b>Grad-CAM inference video</b><br><br>
            <center>
              <video width="35%" controls="controls"/>
                <source src="/assets/images/gradcam_demo.mp4" type="video/mp4"> 
              </video>
            </center>
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Conclusion
              </div>
            </div>
            <br>
            The performance and visualization of the state-of-the-art end-to-end video classification models for recognizing joint engagement demonstrated their potential to recognize complex human-human joint affective states with limited training data. The fine-tuned end-to-end models initially pre-trained for general video understanding (e.g., SlowFast, I3D) performed more effectively on joint engagement recognition than the models trained on human skeleton features (e.g., CTR-GCN, ST-GCN). The video augmentation techniques enhanced the model’s performance even further. The visualization of the learned representations in the end-to-end deep learning models revealed their sensitivity to subtle social cues indicative of parent-child interaction. Altogether, these findings and insights indicate that end-to-end models were able to learn the representation of parent-child joint engagement in an interpretable manner.<br>
            In the future work, we are interested in providing answers to the following discussion points :<br><br>
            1. <b>Personalization</b> Our proposed framework can also be expanded to account for individual differences in affect across dyads by adding a deep neural network layer as the final layer trained on individual human groups<br><br>
            2. <b>Multi-modal representation learning</b> Extend the model learning from a single video-based to multi-modal (e.g., audio, video, text and skeleton) learning and compare the learned representation<br><br>
            3. <b>Comparison of Video Augmentation techniques</b> Apply various type (temporal, spatial, etc) of video augmentation techniques and evaluate, compare the results to demonstrate its effectiveness


 
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Publications
              </div>
            </div>
            <br>
            <p>
              <font size="3">
              <a href="/about/about_team.htm">[1] <u>Y.B.KIM</u>, S.M.Algohwinem, H.W.Park, "Explainable Representations of Human Interaction: Engagement Recognition model with Video Augmentation." accepted in Human-Centered AI Workshop at NeurIPS.</a><br><br>
              <a href="/about/about_team.htm">[2] <u>Y.B.KIM</u>, H.Chen, S.M.Algohwinem, C.Breazeal, H.W.Park, "Joint Engagement Classification using Video Augmentation Techniques for Multi-person Human-robot Interaction." under review at AAMAS 2023.</a>
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