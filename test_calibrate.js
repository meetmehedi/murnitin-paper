// Comprehensive Benchmark & Calibration Script for Murnitin Multi-Feature Engine

const sampleCleanAI = `
Machine learning models have transformed how we approach data classification tasks.
The algorithm processes input features through multiple layers of computation.
Each layer applies a transformation that reduces dimensional complexity.
The output layer produces probability distributions over predefined categories.
Training involves minimizing a loss function through gradient-based optimization.
Regularization techniques prevent overfitting to training data samples.
The model is evaluated on a held-out test set to measure generalization performance.
Cross-validation provides a robust estimate of expected model accuracy.
Hyperparameter tuning improves performance by optimizing configuration settings.
The final model is deployed to production environments for real-time inference.
`.trim();

const sampleBuzzwordAI = `
The expansion of modern urban centers represents a significant transformation in human organization. Historically, populations were concentrated near agricultural centers; however, the industrial revolution altered these distribution patterns. Furthermore, structural developments of steel and glass constitute the primary human habitat. Consequently, navigating a dense metropolitan corridor reveals a structured arrangement of activities. Moreover, this environment is characterized by efficiency, organization, and predictable behaviors. Additionally, this systematic design is what renders urban systems functional. In addition to high population density, municipal administrations implement comprehensive policies to manage resources effectively. Ultimately, these multifaceted urban frameworks facilitate seamless integration of diverse communities.
`.trim();

const sampleInformalHuman = `
So I was trying to get my Python script to run but kept hitting this weird error where the file path had spaces in it and nothing I tried seemed to work.
Turns out you just need to wrap the path in quotes, which I should have figured out like an hour earlier.
Anyway, once that was sorted the rest of it was pretty straightforward.
My friend Sam had the same issue last week and she ended up just moving all her files to a path without spaces, which is honestly probably a cleaner solution.
I spent way too long on this but at least I know for next time.
`.trim();

const sampleFormalAcademicHuman = `
The relationship between poverty and educational attainment has been studied extensively over the past five decades.
While early research focused primarily on material resources such as textbooks and facilities, more recent scholarship has shifted toward examining social and psychological factors.
Children from low-income households often face chronic stress that impairs cognitive development.
This observation has led researchers to question whether interventions targeting academic skills alone are sufficient.
Several longitudinal studies have tracked cohorts from early childhood through adulthood, revealing persistent gaps that widen over time.
The mechanisms driving these disparities remain contested among sociologists and economists.
`.trim();

const sampleHybrid = `
I remember when I first started learning coding, it felt like learning a magical language where a single typo could collapse the universe. It was incredibly frustrating but rewarding. The process of writing computer programs is a highly structured activity. It requires the developer to define clear logical instructions that the computer executes in sequence. Furthermore, software systems must be designed with modularity to ensure ease of maintenance over time. In conclusion, the integration of structured engineering practices is essential for developing scalable software solutions. Honestly, once you cross that initial learning cliff, the logic makes a weird kind of sense.
`.trim();

const sampleEvasion = `
The util\u0456ze of d\u0456g\u0456tal technologies has altered the landscape of educat\u0456on in the modern era. It provides st\u200budents with access to a wide array of educational resources. Furthermore, online learning systems off\u0435r flex\u0456b\u0456l\u0456ty and conv\u0435ni\u0435nce to students across the world.
`.trim();

module.exports = {
  sampleCleanAI,
  sampleBuzzwordAI,
  sampleInformalHuman,
  sampleFormalAcademicHuman,
  sampleHybrid,
  sampleEvasion
};
