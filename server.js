const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { spawn } = require("child_process");
const app = express();

// middle ware
app.use(express.static("public")); //to access the files in public folder
app.use(cors()); // it enables all cors requests
app.use(fileUpload());

const pythonScript = (req, res) => {
  console.log(req);
  const script = spawn("python", ["main.py", req.path]);

  script.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    return res.send({ name: req.path });
  });
};

// file upload api
app.post("/upload", async (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: "file is not found" });
  }
  // accessing the file
  const myFile = req.files.file;
  //  mv() method places the file inside public directory
  myFile.mv(`${__dirname}/public/${myFile.name}`, async function (err) {
    //TODO: checking the type of file
    if (err) {
      console.log(err);
      return res.status(500).send({ msg: "Error occured" });
    }
    //running the script of python
    await pythonScript(
        { name: myFile.name, path: `./public/${myFile.name}` },
        res
      );
    // returing the response with file path and name
  });

  
});

app.get("/picture", (req, res) => {
  res.status(200).sendFile(__dirname + "/output.png");
});

app.get("/csv", (req, res) => {
  res.status(200).sendFile(__dirname + "/output.csv");
});

app.get("/", (req, res) => {
    res.send('Hello World!');
  });

app.listen(process.env.PORT || 8000, () => {
  console.log("server is running at port 8000");
});
