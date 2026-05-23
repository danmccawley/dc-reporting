export default function PhoneFrame({ children }) {
  return (
    <div className="phoneframe">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  );
}
