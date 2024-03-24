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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/health-llm.png");
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
      <h1 style="font-size:40px; color:white; font-family:Arial;">Health-LLM: Large Language Models for Health Prediction via Wearable Sensor Data</h1>
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
    <duration>July 2023 ~ Present</duration>
    <br>
    <organization> MIT, Google Research </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Abstract
            </div>
        </div>
        <br>
        <!-- <img src="/assets/images/xai_jibo.png" alt="aamas-1" style="width:40%;"><br> -->
        <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
          <div align="left">
            Large language models (LLMs) are capable of many natural language tasks, yet they are far from perfect. In health applications, grounding and interpreting domain-specific and non-linguistic data is important. This paper investigates the capacity of LLMs to make inferences about health based on contextual information (e.g. user demographics, health knowledge) and physiological data (e.g. resting heart rate, sleep minutes). We present a comprehensive evaluation of 12 publicly accessible state-of-the-art LLMs with prompting and fine-tuning techniques on four public health datasets (PMData, LifeSnaps, GLOBEM and AW_FB). Our experiments cover 10 consumer health prediction tasks in mental health, activity, metabolic, and sleep assessment. Our fine-tuned model, HealthAlpaca exhibits comparable performance to much larger models (GPT-3.5, GPT-4 and Gemini-Pro), achieving the best or second best performance in 7 out of 10 tasks. Ablation studies highlight the effectiveness of context enhancement strategies. Notably, we observe that our context enhancement can yield up to 23.8% improvement in performance. While constructing contextually rich prompts (combining user context, health knowledge and temporal information) exhibits synergistic improvement, the inclusion of health knowledge context in prompts significantly enhances overall performance.<br><br>
            <h6> Keywords </h6>
            <rt>
              # health-llm # wearable sensor # multi-modal
            </rt>
            <br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <img src="/assets/images/health-llm.png" alt="aamas-1"><br>
            Health-LLM: We presents a framework for evaluating LLM performance on a diverse set of health prediction tasks, training and prompting the models with multi-modal health data.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Dataset & Tasks
              </div>
            </div>
            <img src="/assets/images/health-llm_data.png" alt="aamas-1"><br>
            <b>Consumer Health Tasks</b> We define ten tasks from four datasets and classify them into five topics. * in the prompt indicates the optional contexts for the ablation
            <br><br>
            We consider four wearable sensor datasets that contained: (1) multi-modal physiological data, (2) user self-reported measures, (3) enough distinct time windows to evaluate over. This table summarizes the dataset topic, tasks, metric to evaluate, size and text length presents the features used in the prompt for each task. For the train/test split, we selected 0.1 portion of the original set as the test set and randomly sampled the data from different participants as possible. The choice of ten tasks across four datasets were inspired by the functions provided by consumer health wearables (e.g. Fitbit, Apple Watch) and the previous works of LLMs in diverse applications
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Context Enhancement
              </div>
            </div>
            <br>
            <img src="/assets/images/health-llm_1.png" alt="aamas-1"><br><br>
            We introduce a comprehensive zero-shot prompting along with four types of context enhancements introduced in the table above and equations<br>1) User Context (uc) provides user-specific information such as age, gender, weight, height, etc., which provides additional information that affects the understanding of health knowledge.<br>2) Health Context (hc) provides the definition and equation that controls certain health targets to inject new health knowledge into LLMs.<br>3) Temporal Context (tc) is adopted to test the importance of temporal aspects in time-series data. Instead of using aggregated statistics, we utilize the raw time-series sequence. Among different sets of temporal context representations, we empirically observe that using natural language string showed the best performance.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Experiments
              </div>
            </div>
            <br>
            <img src="/assets/images/health-llm_2.png" alt="aamas-1"><br>
            <b>Performance Evaluation of LLMs on Health Prediction Tasks</b> STRS: Stress, READ: Readiness, FATG: Fatigue, SQ: Sleep Quality, SR: Stress Resilience, SD: Sleep Disorder, ANX: Anxiety, DEP: Depression, ACT: Activity, CAL: Calories. “-” denotes the failure cases due to token size limit or unreasonable responses. “N/A” denotes the case where the prediction is not reported or cannot be conducted. For each column (task), the best result is <b>bolded</b>, and the second best is <u>underlined</u>. CoT denotes the chain-of-thoughts and SC denotes the self-consistency prompting. For each task, arrows in the parenthesis indicate the desired direction of improvement. ↑ indicates higher values are better for accuracy, while ↓ indicates lower values are better for mean absolute error.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Conclusion
              </div>
            </div>
            <br>
            In this paper, we present the first comprehensive evaluation of off-the-shelf LLMs, including MedAlpaca, PMC-Llama, Asclepius, ClinicalCamel, FLAN-T5, Palmyra-Med, Llama 2, BioMedGPT, BioMistral, GPT-series models, and Gemini-Pro, across ten consumer health prediction tasks (binary, multi-class classification, and regression) spanning four public health datasets. Our experiments encompass a variety of prompting and fine-tuning techniques. The results reveal several interesting findings. First, our context enhancement strategy significantly improves performance across all datasets and LLMs, particularly emphasizing the importance of incorporating health knowledge context in prompts. More importantly, our fine-tuned model, HealthAlpaca, demonstrates the best or second-best performance in 7 out of 10 tasks, outperforming much larger models such as GPT-3.5, GPT-4, and Gemini-Pro, even when these are equipped with few-shot prompting. Additionally, we conducted a case study on selected examples to highlight the LLMs' reasoning capabilities and limitations regarding false and hallucinated reasoning in health predictions. However, ethical concerns regarding privacy and bias remain, necessitating further investigation before real-world deployment.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Limitations and Future Works
              </div>
            </div>
            <br>
            This study's reliance on self-reported health data limits its clinical applicability and raises ethical considerations, particularly regarding data validity and user communication. Additionally, the "black-box" nature of LLMs complicates the assessment of their clinical validity. To address these issues, future work will focus on:<br>1) conducting evaluations with clinically diagnosed datasets in collaboration with healthcare professionals to enhance clinical relevance<br>2) ensuring ethical and regulatory compliance, particularly in how health-related predictions are communicated to users<br>3) improving LLMs' explainability to facilitate understanding of their decision-making processes, thereby aiding in the accurate interpretation of health predictions<br>4) incorporating privacy-preserving technologies like federated learning to protect sensitive health information.
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:18px; font-weight:bold">
              <div align="left">
                Publication
              </div>
            </div>
            <br>
            <p>
              <font size="3">
              <a href="https://arxiv.org/abs/2401.06866">[1] <u>Y.B.KIM</u>, Xuhai Xu, Daniel McDuff, Cynthia Breazeal, Hae Won Park "Health-LLM: Large Language Models for Health Prediction via Wearable Sensor Data" Under Review at CHIL 2024.</a><br><br>
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