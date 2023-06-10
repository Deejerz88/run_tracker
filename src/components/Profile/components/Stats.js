import { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";

const Stats = ({ Context }) => {
  const [participant, setParticipant] = useState({});
  const [race, setRace] = useState({});

  useEffect(() => {
    setParticipant(Context.participant);

    let { race: contextRace } = Context;
    contextRace = contextRace.name
      ? contextRace
      : {
          name: "Team Playmakers",
        };

    setRace(contextRace);
  }, [Context]);

  const defaultStats = {
    totalAttendance: 0,
    totalMileage: 0,
    avgMileage: 0,
    totalDuration: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    avgDuration: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    avgPace: {
      minutes: 0,
      seconds: 0,
    },
  };
  return (
    <Row className="stats-row">
      {["race", "Overall"].map((title, i) => {
        title = title === "race" ? race.name : title;
        const stats =
          title === "Overall"
            ? participant
            : participant.races?.find((r) => r.name === title) || defaultStats;
        return (
          <Col key={i}>
            <h2 className="stats-title mt-5">{title}</h2>
            <Row className="w-100 justify-content-center">
              <Card id="attendance-card" className="stat-card">
                <Card.Header>Attendance</Card.Header>
                <Card.Body>
                  <Row>
                    <Col id="attendance-title-col">
                      <Col>
                        <Card.Title>Total</Card.Title>
                      </Col>
                    </Col>
                    <Col className="d-flex justify-content-center">
                      <Card.Text>{stats.totalAttendance || 0}</Card.Text>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card id="pace-card">
                <Card.Header>Pace</Card.Header>
                <Card.Body>
                  <Row>
                    <Col id="pace-title-col">
                      <Col>
                        <Card.Title>Avg</Card.Title>
                      </Col>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>{stats.avgPace?.minutes || 0}</Card.Text>
                      </Row>
                      <Row>
                        <p>mins</p>
                      </Row>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>
                          {Math.round(stats.avgPace?.seconds || 0)}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>secs</p>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Row>
            <Row className="w-100 justify-content-center">
              <Card id="mileage-card">
                <Card.Header>Mileage</Card.Header>
                <Card.Body>
                  <Row>
                    <Col id="mileage-title-col">
                      <Col>
                        <Card.Title>Total</Card.Title>
                      </Col>
                      <Col>
                        <Card.Title>Avg</Card.Title>
                      </Col>
                    </Col>
                    <Col>
                      <Card.Text>
                        {stats.totalMileage?.toFixed(1) || 0}
                      </Card.Text>
                      <Card.Text>{stats.avgMileage?.toFixed(1) || 0}</Card.Text>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card id="duration-card">
                <Card.Header>Duration</Card.Header>
                <Card.Body>
                  <Row>
                    <Col id="duration-title-col">
                      <Col>
                        <Card.Title>Total</Card.Title>
                      </Col>
                      <Col>
                        <Card.Title>Avg</Card.Title>
                      </Col>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>{stats.totalDuration?.hours || 0}</Card.Text>
                      </Row>
                      <Row>
                        <p>hrs</p>
                      </Row>
                      <Row>
                        <Card.Text>
                          {stats.avgDuration?.hours?.toFixed(0) || 0}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>hrs</p>
                      </Row>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>
                          {stats.totalDuration?.minutes?.toFixed(0) || 0}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>mins</p>
                      </Row>
                      <Row>
                        <Card.Text>
                          {stats.avgDuration?.minutes?.toFixed(0) || 0}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>mins</p>
                      </Row>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>
                          {Math.round(
                            stats.totalDuration?.seconds?.toFixed(1) || 0
                          )}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>secs</p>
                      </Row>
                      <Row>
                        <Card.Text>
                          {Math.round(stats.avgDuration?.seconds || 0)}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>secs</p>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Row>
          </Col>
        );
      })}
    </Row>
  );
};

export default Stats;
