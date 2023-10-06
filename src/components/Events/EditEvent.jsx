import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../../components/UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const { id } = useParams();

  const submit = useSubmit();

  // loader함수로 데이터를 받아오나 해당 쿼리를 지우진 않는다 리페칭등 캐싱 매커니즘을 이용하기 위해
  const { data, isInitialLoading, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   // mutate 호출 즉시 실행
  //   onMutate: async (data) => {
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ["events", id] });

  //     const prevEvent = queryClient.getQueryData(["events", id]);

  //     queryClient.setQueryData(["events", id], newEvent);

  //     return {
  //       prevEvent,
  //     }; // 해당 객체가 error의 context가 됨.
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", id], context.prevEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", id]);
  //   },
  // });

  const navigate = useNavigate();

  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {isInitialLoading && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}
      {isError && (
        <>
          <ErrorBlock
            title="Failed to load event"
            message={
              error.info?.message || "Failed to load event. try again later."
            }
          />
          <div className="form-actions">
            <Link to="../" className="button"></Link>
          </div>
        </>
      )}
      {!isInitialLoading && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}

export function loader({ params }) {
  console.log("asdf");
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
