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
import {BsPlusLg} from "react-icons/bs/index.esm.js";

const Goals = ({ participant }) => {
  const [state, setState] = useState({
    type: "",
    event: "Team Playmakers",
    category: "mileage",
    mileage: "100",
    pace: {
      minutes: 10,
      seconds: 0,
    },
    duration: {
      hours: 0,
      minutes: 30,
      seconds: 0,
    },
  });
  const [races, setRaces] = useState([]);

  const handleChange = (e) => {
    e.preventDefault();
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
      <InputGroup className="mt-1">
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
      <InputGroup className="mt-1">
        <FloatingLabel label="Category">
          <Form.Select
            id="goal-category"
            name="category"
            value={state.category}
            onChange={handleChange}
          >
            {["Mileage", "Pace", "Duration", "Finish"].map((category) => {
              if (state.type === "overall" && category === "Finish")
                return null;
              else return <option key={category}>{category}</option>;
            })}
          </Form.Select>
        </FloatingLabel>
      </InputGroup>
    );
  };

  const Target = () => {
    return (
      <InputGroup className="">
        {["hours", "minutes", "seconds"].map((type, i) => {
          return (
            <FloatingLabel key={type} label={type}>
              <Form.Control
                id={`duration`}
                type="number"
                step={type === "seconds" ? 5 : 1}
                value={
                  type === "seconds"
                    ? Math.round(state.duration[type])
                    : state.duration[type]
                }
                onChange={(e) => handleChange({ e, state, setState })}
                name="in"
              />
            </FloatingLabel>
          );
        })}
        {/* <FloatingLabel label="Target">
          
          <Form.Control
            id="goal-target"
            name="target"
            value={state.target}
            onChange={handleChange}
          />
        </FloatingLabel> */}
      </InputGroup>
    );
  };

  useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <Form id="goals-form">
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>New Goal</Accordion.Header>
          <Accordion.Body>
            <Row id="goal-row-1" className="mb-3">
              <Col xs={2} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">1</h2>
              </Col>
              <Col xs={10} className="d-flex align-items-center">
                <ButtonGroup
                  id="goal-type"
                  name="type"
                  className="w-25"
                  onClick={handleChange}
                >
                  <Button
                    variant="danger"
                    id="goal-overall"
                    value="overall"
                    type="radio"
                    name="type"
                    className={state.type === "overall" ? "active" : ""}
                  >
                    Overall
                  </Button>
                  <Button
                    variant="danger"
                    id="goal-event"
                    name="type"
                    value="event"
                    type="radio"
                    className={state.type === "event" ? "active" : ""}
                  >
                    Event
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row id="goal-row-2" className="mb-3">
              <Col
                xs={2}
                className="d-flex justify-content-start align-items-center"
              >
                <h2 className="styled-title goal-number">2</h2>
              </Col>
              <Col xs={10} className="d-flex justify-content-start">
                {state.type === "event" ? <Event /> : <Category />}
              </Col>
            </Row>
            <Row id="goal-row-3" className="mb-3">
              <Col xs={2} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">3</h2>
              </Col>
              <Col xs={10} className="align-items-center">
                {state.type === "event" ? <Category /> : <Target />}
              </Col>
            </Row>
            <Row id="goal-row-4" className="mb-3">
              {state.type === "event" && state.category !== "Finish" && (
                <Col xs={2} className="d-flex justify-content-start">
                  <h2 className="styled-title goal-number">4</h2>
                </Col>
              )}
              <Col
                xs={10}
                className="d-flex justify-content-end align-items-center"
              >
                {state.type === "event" && state.category !== "Finish" && (
                  <Target />
                )}
              </Col>
            </Row>
            <Row id="add-goal-row" className="mb-3">
              <Col xs={12} className="d-flex justify-content-start">
                <Button variant="danger" id="add-goal">
                  <BsPlusLg size='0.8em' className='me-2'/> Add Goal
                </Button>
                <Button variant="danger" id="reset-goal" className="ms-3">
                  Reset
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Form>
  );
};

export default Goals;
