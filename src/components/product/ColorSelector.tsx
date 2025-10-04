import React from 'react';
import { Check } from 'lucide-react';
import { PRODUCT_COLORS } from '../../utils/constants';

interface ColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  className = '',
  disabled = false,
}) => {
  const availableColors = colors.length > 0 ? colors : PRODUCT_COLORS;

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'Black': 'bg-black',
      'White': 'bg-white border border-gray-300',
      'Red': 'bg-red-500',
      'Blue': 'bg-blue-500',
      'Green': 'bg-green-500',
      'Yellow': 'bg-yellow-400',
      'Pink': 'bg-pink-500',
      'Purple': 'bg-purple-500',
      'Orange': 'bg-orange-500',
      'Brown': 'bg-amber-900',
      'Gray': 'bg-gray-500',
      'Navy': 'bg-blue-800',
      'Maroon': 'bg-red-800',
      'Teal': 'bg-teal-500',
      'Olive': 'bg-lime-700',
      'Coral': 'bg-orange-300',
      'Beige': 'bg-amber-100',
      'Gold': 'bg-yellow-300',
      'Silver': 'bg-gray-300',
      'Multi-color': 'bg-gradient-to-r from-red-400 via-purple-500 to-blue-400',
    };

    return colorMap[color] || 'bg-gray-400';
  };

  return (
    <div className={className}>
      <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
        Color
      </h4>
      <div className="flex flex-wrap gap-3">
        {availableColors.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            disabled={disabled}
            className={`
              relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center
              ${getColorClass(color)}
              ${selectedColor === color 
                ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                : 'hover:scale-105'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={color}
          >
            {selectedColor === color && (
              <Check 
                className={`w-4 h-4 ${
                  color === 'White' || color === 'Beige' || color === 'Silver' 
                    ? 'text-gray-900' 
                    : 'text-white'
                }`} 
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Color selector with labels
export const ColorSelectorWithLabels: React.FC<ColorSelectorProps> = (props) => {
  return (
    <div className={props.className}>
      <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
        Color
      </h4>
      <div className="space-y-3">
        {props.colors.map((color) => (
          <button
            key={color}
            onClick={() => props.onColorSelect(color)}
            disabled={props.disabled}
            className={`
              flex items-center w-full p-3 rounded-xl transition-all duration-200
              ${props.selectedColor === color
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300'
              }
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div
              className={`w-8 h-8 rounded-full mr-3 ${getColorClass(color)}`}
            />
            <span className="font-sans text-gray-900 dark:text-white">
              {color}
            </span>
            {props.selectedColor === color && (
              <Check className="w-5 h-5 text-primary ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  function getColorClass(color: string) {
    const colorMap: { [key: string]: string } = {
      'Black': 'bg-black',
      'White': 'bg-white border border-gray-300',
      'Red': 'bg-red-500',
      'Blue': 'bg-blue-500',
      'Green': 'bg-green-500',
      'Yellow': 'bg-yellow-400',
      'Pink': 'bg-pink-500',
      'Purple': 'bg-purple-500',
      'Orange': 'bg-orange-500',
      'Brown': 'bg-amber-900',
      'Gray': 'bg-gray-500',
      'Navy': 'bg-blue-800',
      'Maroon': 'bg-red-800',
      'Teal': 'bg-teal-500',
      'Olive': 'bg-lime-700',
      'Coral': 'bg-orange-300',
      'Beige': 'bg-amber-100',
      'Gold': 'bg-yellow-300',
      'Silver': 'bg-gray-300',
      'Multi-color': 'bg-gradient-to-r from-red-400 via-purple-500 to-blue-400',
    };

    return colorMap[color] || 'bg-gray-400';
  }
};

export default ColorSelector;