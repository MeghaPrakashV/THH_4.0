const GlassCard = ({ children, className = "", hoverGradient = "from-pink-500 to-orange-500", onClick }) => {
  return (
    <div
      className={`glass-card relative overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-5 transition-opacity duration-500"
        style={{ backgroundImage: `linear-gradient(135deg, ${hoverGradient})` }}
      ></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
export default GlassCard;