import React from "react";
import { Modal, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';


export default function TaskModal({ tasks, setSelectedTask, setShowTaskModal, setIsRunning }) {
  return (
    <Modal
      show={true}
      onHide={() => setShowTaskModal(false)}
      centered
      size="sm"
    >
      <Modal.Header closeButton>
        <Modal.Title>Избери задача за фокус</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column gap-2">
          {tasks.map((t) => (
            <Button
              key={t.id}
              variant="outline-secondary"
              className="text-start"
              onClick={() => {
                setSelectedTask(t);
                setShowTaskModal(false);
                setIsRunning(true);
              }}
            >
              {t.title}
            </Button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
          Откажи
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
