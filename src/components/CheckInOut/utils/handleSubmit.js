import $ from "jquery";
import { startCase } from "lodash";

const handleSubmit = async ({ e, participant, table }) => {
  e.preventDefault();
  e.stopPropagation();
  const activeKey = $("#checkInOut").attr("name");
  const fields = $(`input[name=${activeKey}]`);
  const { user_id } = participant;
  console.log("fields", fields);
  const data = { duration: {}, pace: {}, mileage: {}, finish: {} };
  fields.each((i, field) => {
    const { id, value } = field;
    console.log("id", id, "value", value);
    const group = id.split("-")[0];
    const type = id.split("-")[1];
    data[group][type] = value;
  });
  console.log("data", data);
  table.updateData([{ user_id, [`checked${startCase(activeKey)}`]: true }]);
  if (activeKey === "in") {
  }
};

export default handleSubmit;
