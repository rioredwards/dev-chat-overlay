import type { ConfirmRequest } from "../types.js";

interface Props {
  confirm: ConfirmRequest;
  onRespond: (taskId: string, approved: boolean) => void;
}

export function ConfirmDialog({ confirm, onRespond }: Props) {
  return (
    <div className="__dco-confirm">
      <div className="__dco-confirm__label">Confirmation Required</div>
      <div className="__dco-confirm__desc">
        <strong>{confirm.action}</strong>
        <br />
        {confirm.description}
      </div>
      <div className="__dco-confirm__actions">
        <button
          className="__dco-confirm__btn __dco-confirm__btn--reject"
          onClick={() => onRespond(confirm.taskId, false)}
        >
          Reject
        </button>
        <button
          className="__dco-confirm__btn __dco-confirm__btn--approve"
          onClick={() => onRespond(confirm.taskId, true)}
        >
          Approve
        </button>
      </div>
    </div>
  );
}
