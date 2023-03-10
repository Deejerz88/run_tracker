import { useEffect, useState } from "react";
import { Button, Modal, Row, Col } from "react-bootstrap";

const Coaches = ({ tableData }) => {
  const [coaches, setCoaches] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  useEffect(() => {
    if (!tableData.length) return;
    const coachData = [];
    tableData.forEach((participant) => {
      let club_member_num = participant.club_member_num?.toLowerCase();
      if (!club_member_num) return;
      let coach =
        club_member_num.startsWith("c") || club_member_num.startsWith("a");

      if (coach) {
        const type = club_member_num.startsWith("c")
          ? "Coach"
          : club_member_num.startsWith("ac")
          ? "Advisory Coach"
          : "Ambassador";
        coachData.push({ name: participant.name, type });
      }
      const sortOrder = ["Coach", "Advisory Coach", "Ambassador"];
      coachData.sort(
        (a, b) => sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type)
      );
      setCoaches(coachData);
    });
  }, [tableData]);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Coaches</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <b>Name</b>
            </Col>
            <Col>
              {" "}
              <b>Type</b>
            </Col>
          </Row>
          {coaches.map((coach, i) => (
            <Row key={i}>
              <Col>{coach.name}</Col>
              <Col>{coach.type}</Col>
            </Row>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Button id="show-coaches" onClick={() => setShow(true)}>
        Coaches
      </Button>
    </>
  );
};

export default Coaches;
