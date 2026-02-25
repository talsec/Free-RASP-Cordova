struct EventIdentifiers {
    static var generatedNumbers = RandomGenerator.generateRandomIdentifiers(length: 18)
    
    // Channel identifiers for Cordova event emitter
    static let threatChannelKey: String = String(generatedNumbers[0])
    static let raspExecutionStateChannelKey: String = String(generatedNumbers[2])
  
    static let raspExecutionStateIdentifierList: [Int] = [generatedNumbers[3]]
    static let threatIdentifierList: [Int] = generatedNumbers.suffix(15)

}
