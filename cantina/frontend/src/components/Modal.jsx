export default function Modal({ titulo, children }) {
  return (
    <div className="ov">
      <div className="dlg" role="dialog" aria-modal="true">
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
