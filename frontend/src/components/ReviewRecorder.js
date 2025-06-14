import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Buffer } from "buffer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { faMicrophone, faStop, faTrash } from "@fortawesome/free-solid-svg-icons";
import { 
  Client, 
  PrivateKey, 
  AccountId, 
  TokenAssociateTransaction, 
  TokenMintTransaction, 
  TransferTransaction, 
  TokenId 
} from "@hashgraph/sdk";
async function rewardNFT(userAccountIdStr, userPrivateKeyStr) {
  try {
    const OPERATOR_ID = AccountId.fromString("0.0.5880367");
    const OPERATOR_KEY = PrivateKey.fromStringED25519(
      "36b4d5e9343836aa6e6672652d225a4970c46cfb642ec84539216a36a1d992f6"
    );

    const TOKEN_ID = TokenId.fromString("0.0.6163661");

    const client = Client.forTestnet();
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);

    const userAccountId = AccountId.fromString(userAccountIdStr);
    const userPrivateKey = PrivateKey.fromStringED25519(userPrivateKeyStr);

    // Associate NFT token with user account
    try {
      console.log("Associating token with user account...");
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(userAccountId)
        .setTokenIds([TOKEN_ID])
        .freezeWith(client);

      const signedAssociateTx = await associateTx.sign(userPrivateKey);
      const associateTxResponse = await signedAssociateTx.execute(client);
      await associateTxResponse.getReceipt(client);
      console.log("Token associated successfully.");
    } catch (assocError) {
      if (
        assocError.status &&
        assocError.status.toString() === "TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT"
      ) {
        console.log("User already associated with token, continuing...");
      } else {
        throw assocError;
      }
    }

    // Mint the NFT
    console.log("Minting NFT...");
    const metadata = Buffer.from("Thanks for your review!");

    const mintTx = new TokenMintTransaction()
      .setTokenId(TOKEN_ID)
      .setMetadata([metadata])
      .freezeWith(client);

    const mintTxSigned = await mintTx.sign(OPERATOR_KEY);
    const mintTxResponse = await mintTxSigned.execute(client);
    const mintReceipt = await mintTxResponse.getReceipt(client);
    const serial = mintReceipt.serials[0];
    console.log("NFT minted with serial:", serial);

    // Transfer NFT to user
    console.log("Transferring NFT to user...");
    const transferTx = new TransferTransaction()
      .addNftTransfer(TOKEN_ID, serial, OPERATOR_ID, userAccountId)
      .freezeWith(client);

    const transferTxSigned = await transferTx.sign(OPERATOR_KEY);
    const transferTxResponse = await transferTxSigned.execute(client);
    await transferTxResponse.getReceipt(client);
    console.log("NFT transferred successfully.");

    alert(
      `Great! You have received NFT #${serial} on your account (${userAccountId.toString()})`
    );
  } catch (error) {
    console.error("NFT reward failed:", error);
    alert("NFT reward failed. Check console.");
  }
}


function ReviewRecorder({ restaurantId }) {
  const [recordedFile, setRecordedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [textReview, setTextReview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mimeTypeRef = useRef("");

  useEffect(() => {
    let timer = null;
    if (recording) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check if browser supports audio/mp4 or audio/m4a
      let options = null;
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
        mimeTypeRef.current = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/m4a")) {
        options = { mimeType: "audio/m4a" };
        mimeTypeRef.current = "audio/m4a";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
        mimeTypeRef.current = "audio/webm";
      } else {
        alert("Your browser does not support the required audio recording formats.");
        return;
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });

        // Generate audio URL for playback
        const audio = new Audio(URL.createObjectURL(blob));
        setAudioUrl(audio.src);

        // Create file with appropriate extension
        const extension = mimeTypeRef.current.includes("mp4") || mimeTypeRef.current.includes("m4a") ? "m4a" : "webm";
        setRecordedFile(new File([blob], `voice_review.${extension}`, { type: mimeTypeRef.current }));
      };

      recorder.start();
      setRecording(true);
      setSeconds(0);
    } catch (err) {
      alert("Please allow microphone access.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleTextChange = (e) => {
    setTextReview(e.target.value);
    setResult(null);
  };

  const clearRecording = () => {
    setRecordedFile(null);
    setAudioUrl(null);
    setResult(null);
    setSeconds(0);
  };

  const clearText = () => {
    setTextReview("");
    setResult(null);
  };
  const handleSubmit = async () => {
    if (!restaurantId) return;
    if (!recordedFile && !textReview.trim()) {
      alert("Please record audio or enter a text review.");
      return;
    }
  
    setLoading(true);
  
    try {
      let res;
      if (recordedFile) {
        const formData = new FormData();
        formData.append("file", recordedFile);
  
        res = await axios.post(
          `http://localhost:8000/api/restaurant/${restaurantId}/analyze/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        res = await axios.post(
          `http://localhost:8000/api/restaurant/${restaurantId}/analyze/`,
          { text: textReview },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      setResult(res.data);
  
      // Just show the popup - no NFT logic
      toast.success("🎉 Great! You have received an NFT. Enjoy 5% off next time!", {
        position: "top-right",
        autoClose: 5000, // in milliseconds
      });
      
  
    } catch (err) {
      alert("Submission failed. Check console.");
      console.error(err);
    }
  
    setLoading(false);
  };
  
  return (
    <div style={styles.container}>
      <h2>🎤 Submit Your Review</h2>

      {/* Record */}
      <div style={styles.section}>
        <label style={styles.label}>
          <FontAwesomeIcon icon={faMicrophone} /> Record voice (max 30s)
        </label>
        <div style={styles.recorderControls}>
          {!recording ? (
            <button style={styles.recordBtn} onClick={startRecording}>
              <FontAwesomeIcon icon={faMicrophone} /> Start
            </button>
          ) : (
            <button style={styles.stopBtn} onClick={stopRecording}>
              <FontAwesomeIcon icon={faStop} /> Stop
            </button>
          )}
          <span style={styles.timer}>{seconds}s</span>
        </div>
        <p style={{ fontSize: 12, color: "#666" }}>
          Recording stops automatically after 30s.
        </p>
      </div>

      {/* Playback */}
      {audioUrl && (
        <div style={styles.section}>
          <audio controls src={audioUrl} style={styles.audioPlayer} />
          <button style={styles.clearBtn} onClick={clearRecording}>
            <FontAwesomeIcon icon={faTrash} /> Clear Recording
          </button>
        </div>
      )}

      {/* Text input */}
      <div style={styles.section}>
        <label style={styles.label}>Or type your review here:</label>
        <textarea
          value={textReview}
          onChange={handleTextChange}
          rows={5}
          style={styles.textarea}
          placeholder="Write your review..."
        />
        <button
          style={styles.clearBtn}
          onClick={clearText}
          disabled={!textReview.trim()}
        >
          Clear Text
        </button>
      </div>

      {/* Submit */}
      <div style={styles.section}>
        <button
          style={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading || (!recordedFile && !textReview.trim())}
        >
          {loading ? "Analyzing..." : "Submit Review"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={styles.result}>
          <h3>📝 Transcription</h3>
          <pre style={styles.pre}>{result.transcription || "N/A"}</pre>
          <h3>🔍 Analysis</h3>
          <pre style={styles.pre}>
            {JSON.stringify(result.analysis, null, 2)}
          </pre>
        </div>
      )}
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light"
/>

    </div>
  );
}

const styles = {
  container: {
    marginTop: 40,
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    boxShadow: "0 0 8px rgba(0,0,0,0.05)",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: 6,
  },
  recorderControls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  recordBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 5,
    cursor: "pointer",
  },
  stopBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 5,
    cursor: "pointer",
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
  },
  audioPlayer: {
    width: "100%",
    marginTop: 10,
  },
  clearBtn: {
    marginTop: 10,
    background: "transparent",
    color: "#888",
    border: "none",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontWeight: "bold",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    border: "1px solid #ccc",
    resize: "vertical",
  },
  result: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
};

export default ReviewRecorder;
