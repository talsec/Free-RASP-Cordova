struct EventIdentifiers {
    static var generatedNumbers = RandomGenerator.generateRandomIdentifiers(length: 21)
    
    // Channel identifiers for Cordova event emitter
    static let threatChannelKey: String = String(generatedNumbers[0])
    static let raspExecutionStateChannelKey: String = String(generatedNumbers[2])
  
    static let raspExecutionStateIdentifierList: [Int] = Array(generatedNumbers[3...5])
    static let threatIdentifierList: [Int] = generatedNumbers.suffix(15)

}
