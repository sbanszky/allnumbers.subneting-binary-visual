import React, { useState, useEffect } from 'react';

export default function IPv4BitAnimation() {
  const [bits, setBits] = useState<string[]>(Array(32).fill('0'));
  const [subnetBits, setSubnetBits] = useState<string[]>(Array(32).fill('0'));
  const [networkBits, setNetworkBits] = useState<string[]>(Array(32).fill('0'));
  const [broadcastBits, setBroadcastBits] = useState<string[]>(Array(32).fill('0'));
  const [highlightedBit, setHighlightedBit] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [decimalInputs, setDecimalInputs] = useState<string[]>(['0', '0', '0', '0']);
  const [subnetInputs, setSubnetInputs] = useState<string[]>(['0', '0', '0', '0']);

  useEffect(() => {
    calculateAddresses();
  }, [bits, subnetBits]);

  const calculateAddresses = () => {
    // Calculate network address
    const newNetworkBits = bits.map((bit, idx) => 
      bit === '1' && subnetBits[idx] === '1' ? '1' : '0'
    );
    setNetworkBits(newNetworkBits);

    // Calculate broadcast address
    const newBroadcastBits = bits.map((bit, idx) => 
      subnetBits[idx] === '1' ? bit : '1'
    );
    setBroadcastBits(newBroadcastBits);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      let currentBit = 0;
      interval = setInterval(() => {
        if (currentBit >= 32) {
          setIsPlaying(false);
          setHighlightedBit(null);
          return;
        }
        setHighlightedBit(currentBit);
        setBits(prev => {
          const newBits = [...prev];
          newBits[currentBit] = Math.random() > 0.5 ? '1' : '0';
          return newBits;
        });
        currentBit++;
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setBits(Array(32).fill('0'));
    setSubnetBits(Array(32).fill('0'));
    setNetworkBits(Array(32).fill('0'));
    setBroadcastBits(Array(32).fill('0'));
    setHighlightedBit(null);
    setIsPlaying(false);
    setDecimalInputs(['0', '0', '0', '0']);
    setSubnetInputs(['0', '0', '0', '0']);
  };

  const getPowerOfTwo = (bitPosition: number) => {
    return Math.pow(2, 7 - (bitPosition % 8));
  };

  const getOctetValue = (octetIndex: number, bitArray: string[]) => {
    const octetBits = bitArray.slice(octetIndex * 8, (octetIndex + 1) * 8);
    return octetBits.reduce((acc, bit, idx) => {
      return acc + (bit === '1' ? Math.pow(2, 7 - idx) : 0);
    }, 0);
  };

  const handleDecimalInput = (octetIndex: number, value: string, isSubnet: boolean = false) => {
    const num = parseInt(value);
    if (isNaN(num) || value === '') {
      if (isSubnet) {
        setSubnetInputs(prev => {
          const newInputs = [...prev];
          newInputs[octetIndex] = '';
          return newInputs;
        });
      } else {
        setDecimalInputs(prev => {
          const newInputs = [...prev];
          newInputs[octetIndex] = '';
          return newInputs;
        });
      }
      return;
    }

    if (num >= 0 && num <= 255) {
      const binaryStr = num.toString(2).padStart(8, '0');
      
      if (isSubnet) {
        // Validate subnet mask (must be continuous 1s followed by 0s)
        const isValidSubnet = /^1*0*$/.test(binaryStr);
        if (!isValidSubnet) return;

        setSubnetInputs(prev => {
          const newInputs = [...prev];
          newInputs[octetIndex] = num.toString();
          return newInputs;
        });
        setSubnetBits(prev => {
          const newBits = [...prev];
          for (let i = 0; i < 8; i++) {
            newBits[octetIndex * 8 + i] = binaryStr[i];
          }
          return newBits;
        });
      } else {
        setDecimalInputs(prev => {
          const newInputs = [...prev];
          newInputs[octetIndex] = num.toString();
          return newInputs;
        });
        setBits(prev => {
          const newBits = [...prev];
          for (let i = 0; i < 8; i++) {
            newBits[octetIndex * 8 + i] = binaryStr[i];
          }
          return newBits;
        });
      }
    }
  };

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-cyber-mint/10 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-cyber-mint">32-bit IPv4 Structure</h3>
        <div className="space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-cyber-purple/20 text-cyber-mint rounded-lg hover:bg-cyber-purple/30 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-cyber-purple/20 text-cyber-mint rounded-lg hover:bg-cyber-purple/30 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* IP Address Inputs */}
      <div className="mb-4">
        <div className="text-sm text-cyber-mint mb-2">IP Address:</div>
        <div className="flex justify-between gap-4">
          {decimalInputs.map((value, index) => (
            <div key={index} className="flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => handleDecimalInput(index, e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-cyber-mint/30 rounded text-cyber-mint text-center"
                placeholder="0-255"
                maxLength={3}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Subnet Mask Inputs */}
      <div className="mb-6">
        <div className="text-sm text-cyber-mint mb-2">Subnet Mask:</div>
        <div className="flex justify-between gap-4">
          {subnetInputs.map((value, index) => (
            <div key={index} className="flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => handleDecimalInput(index, e.target.value, true)}
                className="w-full px-3 py-2 bg-black/50 border border-cyber-purple/30 rounded text-cyber-purple text-center"
                placeholder="0-255"
                maxLength={3}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-4">
        {[0, 1, 2, 3].map(octet => (
          <div key={octet} className="flex-1">
            {/* MSB/LSB Labels */}
            <div className="grid grid-cols-8 gap-1">
              {Array(8).fill(0).map((_, idx) => (
                <div key={idx} className="text-center">
                  {octet === 0 && idx === 0 && (
                    <div className="text-xs text-cyber-mint font-bold mb-1">MSB</div>
                  )}
                  {(octet === 1 || octet === 2) && idx === 0 && (
                    <div className="text-xs text-cyber-mint font-bold mb-1">&nbsp;</div>
                  )}
                  {octet === 3 && idx === 7 && (
                    <div className="text-xs text-cyber-mint font-bold mb-1">LSB</div>
                  )}
                </div>
              ))}
            </div>

            {/* Octet Label */}
            <div className="text-center mb-1">
              <span className="text-xs text-cyber-mint font-bold">Octet {octet + 1}</span>
            </div>

            {/* Powers of 2 */}
            <div className="grid grid-cols-8 gap-1">
              {Array(8).fill(0).map((_, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xs text-cyber-mint">2<sup>{7-idx}</sup></div>
                  <div className="text-xs text-cyber-purple">{getPowerOfTwo(idx)}</div>
                </div>
              ))}
            </div>

            {/* IP Address Bits */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              {bits.slice(octet * 8, (octet + 1) * 8).map((bit, idx) => {
                const globalIdx = octet * 8 + idx;
                return (
                  <div key={globalIdx} className="relative">
                    <div
                      className={`
                        aspect-square flex items-center justify-center text-sm font-mono
                        ${highlightedBit === globalIdx ? 'bg-cyber-mint text-black' : 'bg-black/50 text-cyber-mint'}
                        ${bit === '1' ? 'border-2 border-cyber-mint' : 'border border-cyber-mint/30'}
                        rounded transition-all duration-200
                      `}
                    >
                      {bit}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subnet Mask Bits */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              {subnetBits.slice(octet * 8, (octet + 1) * 8).map((bit, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`
                      aspect-square flex items-center justify-center text-sm font-mono
                      bg-black/50 text-cyber-purple
                      ${bit === '1' ? 'border-2 border-cyber-purple' : 'border border-cyber-purple/30'}
                      rounded transition-all duration-200
                    `}
                  >
                    {bit}
                  </div>
                </div>
              ))}
            </div>

            {/* Network Address Bits */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              {networkBits.slice(octet * 8, (octet + 1) * 8).map((bit, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`
                      aspect-square flex items-center justify-center text-sm font-mono
                      bg-black/50 text-cyber-blue
                      ${bit === '1' ? 'border-2 border-cyber-blue' : 'border border-cyber-blue/30'}
                      rounded transition-all duration-200
                    `}
                  >
                    {bit}
                  </div>
                </div>
              ))}
            </div>

            {/* Broadcast Address Bits */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              {broadcastBits.slice(octet * 8, (octet + 1) * 8).map((bit, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`
                      aspect-square flex items-center justify-center text-sm font-mono
                      bg-black/50 text-cyber-blue
                      ${bit === '1' ? 'border-2 border-cyber-blue' : 'border border-cyber-blue/30'}
                      rounded transition-all duration-200
                    `}
                  >
                    {bit}
                  </div>
                </div>
              ))}
            </div>

            {/* Values */}
            <div className="space-y-2 text-center mt-2">
              <div className="text-cyber-mint text-sm">
                IP Value: {getOctetValue(octet, bits)}
              </div>
              <div className="text-cyber-purple text-sm">
                Mask Value: {getOctetValue(octet, subnetBits)}
              </div>
              <div className="text-cyber-blue text-sm">
                Network: {getOctetValue(octet, networkBits)}
              </div>
              <div className="text-cyber-blue text-sm">
                Broadcast: {getOctetValue(octet, broadcastBits)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-cyber-purple text-sm space-y-2">
        <p>• Each octet represents 8 bits (1 byte) of the IPv4 address</p>
        <p>• MSB: Most Significant Bit | LSB: Least Significant Bit</p>
        <p>• Total bits: 32 (4 octets × 8 bits)</p>
        <p>• Each bit position represents a power of 2, from 2⁷ (128) to 2⁰ (1)</p>
        <p>• Subnet mask must be continuous 1s followed by 0s</p>
        <p>• Network address is calculated by performing a bitwise AND between IP address and subnet mask</p>
        <p>• Broadcast address sets all host bits (0s in subnet mask) to 1 while keeping network bits unchanged</p>
        <p>• Network address represents the start of a subnet, while broadcast address represents its end</p>
      </div>
    </div>
  );
}