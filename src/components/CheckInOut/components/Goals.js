import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  FloatingLabel,
} from "react-bootstrap";
import axios from "axios";

const Goals = ({ participant }) => {
  const [state, setState] = useState({
    type: "",
  });
  const [races, setRaces] = useState([]);

  const handleChange = (e) => {
    const { id } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: e.target.value,
    }));
  };

  useEffect(() => {
    (async () => {
      const { data: races } = await axios.get("/race");
      setRaces(races);
    })();
  }, []);

  return (
    <Form id="goals-form">
      <InputGroup className="mb-3">
        <FloatingLabel label="Type" className="mb-3">
          <Form.Select
            aria-label="Type"
            id="type"
            name="type"
            value={state.type}
            onChange={handleChange}
          >
            <option value="event">Event</option>
            <option value="overall">Overall</option>
          </Form.Select>
        </FloatingLabel>
        <FloatingLabel label="Event" className="mb-3">
          <Form.Select aria-label="Event" id="event">
            {races.map((race) => (
              <option key={race.name} value={race.name}>{race.name}</option>
            ))}
          </Form.Select>
        </FloatingLabel>
      </InputGroup>
    </Form>
  );
};

export default Goals;
