import { Link, useNavigate } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation } from "@tanstack/react-query";
import { queryClient, createNewEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const { mutate, isLoading, isError, error } = useMutation({
    // 필수가 아님 데이터전송을 캐시처리하지 않기 때문
    // mutationKey
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/");
    },
  });

  const navigate = useNavigate();

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isLoading && "Sobmitting..."}
        {!isLoading && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            "Failed to create event. Please check your inputs"
          }
        />
      )}
    </Modal>
  );
}
