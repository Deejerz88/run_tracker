import { Form, FloatingLabel, InputGroup, Col } from "react-bootstrap";
import { DateTime } from "luxon";

const Race = (state, races, handleChange) => {
  const raceList = ["", ...races];
  return (
    <>
      <FloatingLabel label="Race">
        <Form.Select
          id="goal-race"
          name="race"
          value={state.race}
          onChange={handleChange}
        >
          {raceList.map((race, i) => (
            <option key={i}>{race.name}</option>
          ))}
        </Form.Select>
      </FloatingLabel>
    </>
  );
};

const Category = (state, handleChange) => {
  return (
    <>
      <FloatingLabel label="Category">
        <Form.Select
          id="goal-category"
          name="category"
          value={state.category}
          onChange={handleChange}
        >
          {["", "Mileage", "Average Pace", "Duration", "Finish"].map(
            (category) => {
              if (state.type === "overall" && category === "Finish")
                return null;
              else return <option key={category}>{category}</option>;
            }
          )}
        </Form.Select>
      </FloatingLabel>
    </>
  );
};

const Mileage = (state, handleChange) => {
  return (
    <FloatingLabel label="Miles">
      <Form.Control
        id="mileage"
        type="number"
        name="target"
        value={state.mileage}
        onChange={handleChange}
        className=""
      />
    </FloatingLabel>
  );
};

const Pace = (state, handleBlur) => {
  return (
    <InputGroup>
      {["minutes", "seconds"].map((type, i) => {
        return (
          <FloatingLabel key={type} label={type}>
            <Form.Control
              id={`pace-${type}`}
              type="number"
              name="target"
              step={type === "seconds" ? 5 : 1}
              defaultValue={
                state.pace[type] && type === "seconds"
                  ? Math.round(state.pace[type])
                  : state.pace[type]
              }
              onBlur={handleBlur}
            />
          </FloatingLabel>
        );
      })}
    </InputGroup>
  );
};

const Duration = (state, handleBlur) => {
  return (
    <>
      {["hours", "minutes", "seconds"].map((type, i) => {
        return (
          <FloatingLabel key={type} label={type}>
            <Form.Control
              id={`duration-${type}`}
              type="number"
              name="target"
              step={type === "seconds" ? 5 : 1}
              defaultValue={
                state.duration.seconds && type === "seconds"
                  ? Math.round(state.duration[type])
                  : state.duration[type]
              }
              onBlur={handleBlur}
            />
          </FloatingLabel>
        );
      })}
    </>
  );
};

const Target = (state, handleChange, handleBlur) => {
  return {
    Mileage: <Mileage state={state} handleChange={handleChange} />,
    "Average Pace": <Pace handleBlur={handleBlur} />,
    Duration: <Duration handleBlur={handleBlur} />,
  }[state.category];
};

const GoalDate = (state, handleChange) => {
  return (
      <InputGroup
        id="date-group"
      >
        <FloatingLabel label="Complete By">
          <Form.Control
            id="goal-date"
            type="date"
            name="goal-date"
            value={state.date || DateTime.now().toISODate()}
            onChange={handleChange}
          />
        </FloatingLabel>
      </InputGroup>
  );
};

const GoalInputs = (i, state, race, races, handleBlur, handleChange) => {
  return (
    <>
      {i === 2 ? (
        race ? (
          <Race state={state} races={races} handleChange={handleChange} />
        ) : (
          <Category state={state} handleChange={handleChange} />
        )
      ) : i === 3 ? (
        race ? (
          <Category state={state} handleChange={handleChange} />
        ) : (
          <Target />
        )
      ) : i === 4 ? (
        race ? (
          <Target state={state} handleChange={handleChange} />
        ) : (
          <GoalDate />
        )
      ) : (
        <GoalDate />
      )}
    </>
  );
};
