import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  FloatingLabel,
  ButtonGroup,
  Accordion,
} from "react-bootstrap";
import axios from "axios";

const Goals = ({ participant }) => {
  const [state, setState] = useState({
    type: "event",
    event: "Team Playmakers",
    category: "mileage",
    target: "100",
  });
  const [races, setRaces] = useState([]);

  const handleChange = (e) => {
    const { name } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: e.target.value,
    }));
  };

  useEffect(() => {
    (async () => {
      const { data: races } = await axios.get("/race");
      setRaces(races);
    })();
  }, []);

  const Event = () => {
    return (
      <InputGroup className="mb-3">
        <FloatingLabel label="Event">
          <Form.Select
            id="goal-event"
            name="event"
            value={state.event}
            onChange={handleChange}
          >
            {races.map((race) => (
              <option key={race.name}>{race.name}</option>
            ))}
          </Form.Select>
        </FloatingLabel>
      </InputGroup>
    );
  };

  const Category = () => {
    return (
      <ButtonGroup toggle id="goal-category" name="category" className="">
        {["Complete", "Attendance", "Mileage", "Duration", "Avg Pace"].map(
          (category) => {
            if (state.type === "overall" && category === "Complete")
              return null;
            else
              return (
                <Button
                  key={category}
                  variant="danger"
                  id={`goal-${category}`}
                  value={category}
                  onClick={handleChange}
                  className={state.category === category.toLowerCase() ? "active" : ""}
                >
                  {category}
                </Button>
              );
          }
        )}
      </ButtonGroup>
    );
  };

  const Target = () => {
    return (
      <InputGroup className="mb-3">
        <FloatingLabel label="Target">
          <Form.Control
            id="goal-target"
            name="target"
            type={
              state.category === "Duration" || state.category === "pace"
                ? "time"
                : "number"
            }
            value={state.target}
            onChange={handleChange}
          />
        </FloatingLabel>
      </InputGroup>
    );
  };

  return (
    <Form id="goals-form">
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>New Goal</Accordion.Header>
          <Accordion.Body>
            <Row className="j mb-3">
              <Col xs={2} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">1</h2>
              </Col>
              <Col xs={10} className="d-flex align-items-center">
                <ButtonGroup id="goal-type" name="type" className="w-25">
                  <Button
                    variant="danger"
                    id="goal-overall"
                    value="overall"
                    className={state.type === "overall" ? "active" : ""}
                    onClick={handleChange}
                  >
                    Overall
                  </Button>
                  <Button
                    variant="danger"
                    id="goal-event"
                    name="type"
                    value="event"
                    className={state.type === "event" ? "active" : ""}
                    onClick={handleChange}
                  >
                    Event
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col
                xs={2}
                className="d-flex justify-content-start align-items-center"
              >
                <h2 className="styled-title goal-number">2</h2>
              </Col>
              <Col xs={10} className="d-flex justify-content-start">
                {state.type && state.type === "event" ? (
                  <Event />
                ) : (
                  <Category />
                )}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={2} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">3</h2>
              </Col>
              <Col xs={10} className="">
                {state.type && state.type === "event" ? (
                  <Category />
                ) : (
                  <Target />
                )}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={2} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">4</h2>
              </Col>
              <Col xs={10} className="d-flex justify-content-end">
                {state.type &&
                state.type === "event" &&
                state.category !== "complete" ? (
                  <Target />
                ) : null}
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Form>
  );
};

export default Goals;
