import React, { useEffect, useState } from "react";
import { Row, Col, Card, Container } from "react-bootstrap";

const Stats = ({ participant, race }) => {
  return (
    <Row className="stats-row m-3">
      {["race", "Overall"].map((title, i) => {
        title = title === "race" ? race.name : title;
        const stats =
          title === "Overall" && participant.totalDuration
            ? participant
            : participant.races?.find((r) => r.name === title) || {
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
          <Container key={i} fluid className="stats-container">
            <h2 id="stats-title">{title}</h2>
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
                      <Card.Text>{stats.totalAttendance}</Card.Text>
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
                        <Card.Text>{stats.avgPace?.minutes}</Card.Text>
                      </Row>
                      <Row>
                        <p>mins</p>
                      </Row>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>
                          {Math.round(stats.avgPace?.seconds)}
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
                      <Card.Text>{stats.totalMileage?.toFixed(1)}</Card.Text>
                      <Card.Text>{stats.avgMileage?.toFixed(1)}</Card.Text>
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
                        <Card.Text>{stats.totalDuration?.hours}</Card.Text>
                      </Row>
                      <Row>
                        <p>hrs</p>
                      </Row>
                      <Row>
                        <Card.Text>{stats.avgDuration?.hours}</Card.Text>
                      </Row>
                      <Row>
                        <p>hrs</p>
                      </Row>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>{stats.totalDuration?.minutes}</Card.Text>
                      </Row>
                      <Row>
                        <p>mins</p>
                      </Row>
                      <Row>
                        <Card.Text>{stats.avgDuration?.minutes}</Card.Text>
                      </Row>
                      <Row>
                        <p>mins</p>
                      </Row>
                    </Col>
                    <Col>
                      <Row>
                        <Card.Text>
                          {Math.round(stats.totalDuration?.seconds)}
                        </Card.Text>
                      </Row>
                      <Row>
                        <p>secs</p>
                      </Row>
                      <Row>
                        <Card.Text>
                          {Math.round(Math.round(stats.avgDuration?.seconds))}
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
          </Container>
        );
      })}
    </Row>
  );
};

export default Stats;
