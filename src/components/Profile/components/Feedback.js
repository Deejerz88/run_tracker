import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import $ from "jquery";
import axios from "axios";
import { toast, Flip } from "react-toastify";

const Feedback = ({ participant, race }) => {
  const [feedbackData, setFeedbackData] = useState({
    subject: "",
    message: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    let { id, value } = e.target;
    let key = id.replace(/ /g, "_").toLowerCase();
    setFeedbackData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { subject, message } = feedbackData;
    if (!subject || !message) {
      toast.error("Please enter a subject and message", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
      return;
    }
    try {
      await axios.post("/feedback", {
        ...feedbackData,
        participant,
        race,
      });
      setFeedbackData({ subject: "", message: "" });
      $("#subject").val("");
      $("#message").val("");
      $("#anonymous").prop("checked", false);
      toast.success("Feedback submitted", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
    } catch (err) {
      console.log("err", err);
      toast.error("Error submitting feedback", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
    }
  };

  return (
    <Form id="feedback-form" onSubmit={handleSubmit} onChange={handleChange}>
      <h2 className="styled-title">Feedback</h2>
      <hr className="styled-hr w-25 mt-2" />
      <Form.Group as={Row} className="m-3">
        <Form.Label column sm={2}>
          <b>Subject</b>
        </Form.Label>
        <Col sm={10}>
          <Form.Control id="subject" type="text" />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="m-3 mb-0">
        <Form.Label column sm={2}>
          <b>Message</b>
        </Form.Label>
        <Col sm={10}>
          <Form.Control id="message" as="textarea" rows={3} />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mx-4 mb-3 mt-1">
        <Form.Label column sm={2}></Form.Label>
        <Col sm={10}>
          <Form.Check
            id="anonymous"
            type="checkbox"
            label="Submit anonymously"
          />
        </Col>
      </Form.Group>

      <Row
        id="submit-feedback-row"
        style={{
          display:
            feedbackData.subject && feedbackData.message ? "flex" : "none",
        }}
      >
        <Col className="d-flex justify-content-end">
          <Button variant="outline-danger" type="submit">
            Submit
          </Button>
        </Col>
        <Col>
          <Button
            variant="outline-danger"
            type="reset"
            onClick={() => {
              $("#submit-feedback-row").hide();
              setFeedbackData({ subject: "", message: "" });
            }}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default Feedback;
