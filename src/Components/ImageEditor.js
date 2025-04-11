import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ImageEditor.module.css";
import { saveAs } from "file-saver";
import { fabric } from "fabric";

const ImageEditor = () => {
  const location = useLocation();
  const imageUrl = location.state.imageUrl;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [globalFabricCanvas, setGlobalFabricCanvas] = useState(null);
  const [error, setError] = useState(null);
  const [text, setText] = useState("");
  const [layers, setLayers] = useState([]);

  const canvasRef = useRef(null);

  useEffect(() => {
    const checkCanvas = () => {
      if (!canvasRef.current) {
        return;
      }
        setIsLoading(true);
        
      //create fabric canvas and add image
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true,
        width: 720,
        height: 600,
        
      });
    
      fabric.Image.fromURL(imageUrl, (img) => {
        // Calculate scale to fit canvas while maintaining aspect ratio
        const canvasWidth = fabricCanvas.width;
        const canvasHeight = fabricCanvas.height;
        
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const scaleX = canvasWidth / imgWidth;
        const scaleY = canvasHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply scaling
        img.scale(scale);
        
        // Center the image
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      }, {crossOrigin: 'anonymous'});
      setGlobalFabricCanvas(fabricCanvas);
      setIsLoading(false);
    };

    const timeout = setTimeout(() => {
      checkCanvas();
    }, 500);

    console.log(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [imageUrl, navigate]);

  //create layers
  const canvasLayers = () => {
    const layers = globalFabricCanvas &&
        globalFabricCanvas.getObjects().map((obj, index) => {
          return {
            type: obj.type,
            name: obj.name,
            index: index,
            zIndex: obj.zIndex,
          };
        });
    setLayers(layers)
  };

  //add text to the image
  const handleAddText = (e) => {
    e.preventDefault();
    if (globalFabricCanvas) {
      const fabricText = new fabric.Text(text, {
        selectable: true,
        fill: "white",
        name: "text",
      });
      globalFabricCanvas.add(fabricText);
      fabricText.bringToFront();
      globalFabricCanvas.setActiveObject(fabricText);
      globalFabricCanvas.renderAll();
    }
    setText("");
    canvasLayers();
  };

  //add shape to the image

  const handleAddShape = (shape) => {
    if (globalFabricCanvas) {
      let fabricShape = null;

      if (shape === "rectangle") {
        fabricShape = new fabric.Rect({
          width: 100,
          height: 100,
          fill: "red",
          name: "shape",
        });
      } else if (shape === "circle") {
        fabricShape = new fabric.Circle({
          radius: 50,
          fill: "blue",
          name: "shape",
        });
      } else if (shape === "polygon") {
        const points = [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 150, y: 200 },
          { x: 100, y: 200 },
          { x: 100, y: 100 },
          { x: 100, y: 100 },
        ];
        fabricShape = new fabric.Polyline(points, {
          fill: "green",
          name: "shape",
        });
      } else if (shape === "triangle") {
        fabricShape = new fabric.Triangle();
        fabricShape.name = "shape";
      }

      globalFabricCanvas.add(fabricShape);

      const canvasObject = globalFabricCanvas.getObjects();
      globalFabricCanvas.setActiveObject(fabricShape);
      canvasObject.forEach((obj) => {
        if (obj.type === "text") {
          obj.bringToFront();
        }
      });
      globalFabricCanvas.renderAll({});
    }
    canvasLayers();
  };

  // Handle download
  const handleDownload = async() => {
    if (globalFabricCanvas) {
      const dataURL = globalFabricCanvas.toDataURL({
        format: "png",
        quality: 1.0,
      });   
   saveAs(dataURL, "edited-image.png");
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!globalFabricCanvas) return;

    const activeObject = globalFabricCanvas.getActiveObject();
    if (activeObject) {
      globalFabricCanvas.remove(activeObject);
      globalFabricCanvas.renderAll();
    }
    canvasLayers();
  };
  

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Image</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Search</button>
      </div>
    );
  }

  return (
    <div className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <h2>Customize Your Image</h2>
        <button className={styles.backButton} onClick={() => navigate("/")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Search
        </button>
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.previewContainer}>
          <div className={styles.imagePreview}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className={styles.toolsContainer}>
          <div className={styles.toolGroup}>
            {/* <h3>Add Text</h3> */}
            <input
              type="text"
              value={text}
              className={styles.textInput}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handleAddText}>Add Text</button>
            {/* </div> */}
          </div>

          <div className={styles.toolGroup}>
            <h3>Add Images</h3>

            <div className={styles.shapeButtons}>
              <button onClick={() => handleAddShape("rectangle")}>
                Rectangle
              </button>
              <button onClick={() => handleAddShape("circle")}>Circle</button>
              <button onClick={() => handleAddShape("polygon")}>polygon</button>
              <button onClick={() => handleAddShape("triangle")}>
                Triangle
              </button>
            </div>
          </div>

          <div className={styles.toolGroup}>
            <h3>Actions</h3>
            
<button className={styles.deleteButton} onClick={handleDelete}>Delete Selected Item</button>
            <button
              className={styles.downloadButton}
              onClick={handleDownload}
              disabled={isLoading}
            >
              Download Image
            </button>
          </div>
          {layers.length > 0 && (
            <div className={styles.toolGroup}>
              <h3>Layers</h3>
              <ul>
                {layers.map((layer, index) => (
                  <li key={index}>
                    {layer.name} - {layer.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
