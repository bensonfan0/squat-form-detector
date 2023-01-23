// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { nextFrame } from "@tensorflow/tfjs";
// 2. TODO - Import drawing utility here
import {drawRect, labelMap} from "./utilities"; 

function App() {
  const [squatPosition, setSquatPosition] = useState(1)
  const [squatAdvice, setSquatAdvice] = useState("Welcome to my app! Stand in a clear area to begin")
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);


  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    const net = await tf.loadGraphModel('https://squatobjectdetection.s3.ca-tor.cloud-object-storage.appdomain.cloud/model.json')
    
    // Loop and detect
    setInterval(() => {
      detect(net);
    }, 16.7);
  };

  // Check data is available
  // useEffect(() => {
  //   if (squatPosition === 1) {
  //     squatAdvice = "Stand tall, with your feet shoulder-width apart or slightly wider and your toes facing forward or slightly angled out \n Keep your hips level and square \m Prepare to Bend your knees and hinge forward at the hips at the same rate to lower into the squat"
  //   } else if (squatPosition === 2) {
  //     squatAdvice = "Keep your hips square, your torso upright, and your spine neutral throughout the movement. Engage your glutes, and push through your heels to stand up"
  //   }
  // })


  const detect = async (net) => {

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)
      
      // Debug network obj here
      console.log(await obj[6].array())
      const boxes = await obj[4].array()
      const classes = await obj[7].array()
      const scores = await obj[6].array()
    
      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)  
      console.log(classes[0])
      if (Array.isArray(classes[0]) && classes[0].length > 0) {
        setSquatPosition(classes[0][0])
        console.log(squatPosition)
      }
      requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.9, videoWidth, videoHeight, ctx)}); 

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(()=> {
    console.log("do I ever get called again?")
    if (squatPosition === 1) {
      setSquatAdvice("Stand tall, with your feet shoulder-width apart or slightly wider and your toes facing forward or slightly angled out \n Keep your hips level and square \m Prepare to Bend your knees and hinge forward at the hips at the same rate to lower into the squat")
    } else if (squatPosition === 2) {
      setSquatAdvice("Keep your hips square, your torso upright, and your spine neutral throughout the movement. Engage your glutes, and push through your heels to stand up")
    }
    console.log(squatAdvice)
  },[squatPosition]);

  useEffect(()=>{
    runCoco()
  },[]);

  return (
    <div className="App">
      <header className="App-header">
        <div class="container">
          <div class="item-webcam">
            <Webcam
              ref={webcamRef}
              muted={true} 
              style={{
                // position: "absolute",
                // marginLeft: "auto",
                // marginRight: "auto",
                // left: 0,
                // right: 0,
                // textAlign: "center",
                // zindex: 9,
                // width: 640,
                // height: 480,
              }}
            />
            {/* canvas is where the square is drawn*/}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 8,
                width: 640,
                height: 480,
              }}
            />
          </div>
          <div class="item-squattips">
            <text>
              {squatAdvice}
            </text>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
