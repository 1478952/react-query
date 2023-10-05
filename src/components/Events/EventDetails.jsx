import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const { data, isInitialLoading, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params["id"], signal }),
    staleTime: 5000,
  });

  const {
    mutate,
    isLoading,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/");
    },
  });

  const date = new Date(data?.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const handleDeleteBtn = () => {
    mutate({ id: params.id });
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event?</p>
          <div className="form-actions">
            {isLoading && <p>Deleting, please wait...</p>}
            {!isLoading && (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDeleteBtn} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete event"
              message={errorDeleting.info?.message || "Failed to delete event"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      <article id="event-details">
        {isInitialLoading && (
          <div id="event-details-content" className="center">
            <p>Fetching event data...</p>
          </div>
        )}
        {isError && (
          <ErrorBlock
            title="Failed to load event"
            message={error.info?.message || "Please try again later."}
          />
        )}
        {!isInitialLoading && (
          <>
            <header>
              <h1>{data?.title}</h1>
              <nav>
                <button onClick={handleStartDelete}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data?.image}`}
                alt={data?.title}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data?.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {date} @ {data.time}
                  </time>
                </div>
                <p id="event-details-description">{data?.description}</p>
              </div>
            </div>
          </>
        )}
      </article>
    </>
  );
}
