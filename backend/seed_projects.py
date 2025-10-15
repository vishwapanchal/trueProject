import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, TEXT
from sqlalchemy.orm import sessionmaker, declarative_base

def seed_data():
    """
    Connects to the database, creates the 'existing_projects' table,
    and populates it with a predefined list of projects.
    """
    # --- 1. SETUP AND CONNECTION ---
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")

    if not db_url:
        print("❌ Error: DATABASE_URL not found in .env file.")
        return

    print("Connecting to the database...")
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    # --- 2. DEFINE THE TABLE MODEL ---
    class ExistingProject(Base):
        __tablename__ = 'existing_projects'
        id = Column(Integer, primary_key=True)
        title = Column(TEXT, nullable=False)
        synopsis = Column(TEXT)

    # --- 3. PROJECT DATA TO BE INSERTED ---
    projects_data = [
        {'id': 1, 'title': 'Predictive models and pattern recognition for gene expression analysis', 'synopsis': 'This project aims to develop machine learning models to analyze gene expression data, identify significant patterns, and build a predictive tool for early disease diagnosis based on genetic markers.'},
        {'id': 2, 'title': 'Smart Wearable for Mental Health Monitoring', 'synopsis': 'The project involves creating a wearable device that tracks physiological signals like heart rate variability. An app will analyze this data to detect stress patterns and provide real-time mental health feedback.'},
        {'id': 3, 'title': 'Congestion-Reliability-Availability Relationship in Packet-Switching Computer Networks', 'synopsis': 'This research analyzes the trade-offs between network congestion, data reliability, and service availability in packet-switching networks, proposing a model to optimize performance.'},
        {'id': 4, 'title': 'IoT based Vehicle Speed Monitoring and Controlling System', 'synopsis': "This project proposes an IoT system using GPS to monitor vehicle speed in real-time. If a vehicle exceeds the speed limit for a geo-fenced area, it alerts the driver and can limit acceleration."},
        {'id': 5, 'title': 'Smart Wearable for Personal Safety', 'synopsis': "A smart wearable device designed to enhance personal safety by detecting falls or panic triggers. When activated, it automatically sends an SOS message with the user's location to pre-defined contacts."},
        {'id': 6, 'title': 'Block Chain based Aqua life Preservation', 'synopsis': 'This project aims to build a decentralized ledger using blockchain to track and verify the seafood supply chain, ensuring that aqua life is sourced sustainably and combating illegal fishing.'},
        {'id': 7, 'title': 'Revolutionizing Shopping Experience', 'synopsis': 'This project focuses on integrating augmented reality (AR) into a mobile shopping application, allowing users to virtually try on clothes or visualize products in their homes before purchasing.'},
        {'id': 8, 'title': 'Virtual LAN Monitoring System', 'synopsis': 'A software tool designed to monitor traffic, performance, and security within a Virtual Local Area Network (VLAN), providing administrators with real-time analytics and alerts.'},
        {'id': 9, 'title': 'IoT-enabled Air Conditioning System', 'synopsis': 'This project involves developing a smart AC system that uses IoT sensors to learn user preferences and room occupancy, automatically adjusting temperature to optimize comfort and energy consumption.'},
        {'id': 10, 'title': 'IoT-powered Fleet Management System', 'synopsis': 'An IoT solution for logistics companies to manage their fleet of vehicles. The system provides real-time tracking, fuel monitoring, route optimization, and maintenance alerts.'},
        {'id': 11, 'title': 'Ant Colony Based Optimisation for routing Algorithms', 'synopsis': 'This project explores the use of Ant Colony Optimization (ACO), a swarm intelligence algorithm, to find the most efficient paths for data packet routing in a computer network.'},
        {'id': 12, 'title': 'Wormhole attacks in wireless networks', 'synopsis': 'A study and simulation of wormhole attacks in wireless ad-hoc networks. The project aims to develop a detection and prevention mechanism to secure network routing protocols.'},
        {'id': 13, 'title': 'Evaluating the Vulnerability of Network Traffic Using Joint Security and Routing Analysis', 'synopsis': 'This project proposes a framework that simultaneously analyzes routing paths and security protocols to identify and quantify vulnerabilities in network traffic against sophisticated cyber-attacks.'},
        {'id': 14, 'title': 'Smart Waste Management System', 'synopsis': 'An IoT-based system that uses ultrasonic sensors in public trash bins to detect fill levels. It optimizes waste collection routes, reducing fuel consumption and operational costs.'},
        {'id': 15, 'title': 'Spam Detection Accuracy using Advance Algorithm', 'synopsis': 'This project implements and compares advanced machine learning algorithms, such as recurrent neural networks (RNNs), to improve the accuracy and efficiency of email spam detection filters.'},
        {'id': 16, 'title': 'Comparative performance studies of SVM vs. deep learning models on standard datasets', 'synopsis': 'A research project that evaluates and compares the performance of Support Vector Machines (SVM) against deep learning models (like CNNs) on benchmark datasets for image classification tasks.'},
        {'id': 17, 'title': 'Smart Resume Analyser', 'synopsis': 'A web application that uses Natural Language Processing (NLP) to parse and analyze resumes, extracting key information like skills and experience to rank candidates for a specific job description.'},
        {'id': 18, 'title': 'IoT-based Personal Safety System', 'synopsis': 'This project focuses on a portable IoT device that can be activated in emergencies. It features a panic button, fall detection, and GPS tracking to alert family members or authorities.'},
        {'id': 19, 'title': 'AI-Powered Fish Oil Supplement Recommender for Nutrition', 'synopsis': 'An AI-driven system that recommends specific fish oil supplements to users based on their dietary habits, health goals, and lifestyle, as provided through a user-friendly questionnaire.'},
        {'id': 20, 'title': 'Scalable Peer-to-Peer (P2P) File Sharing Network', 'synopsis': 'The design and implementation of a decentralized, scalable P2P file-sharing application that ensures efficient file discovery and transfer without relying on a central server.'},
        {'id': 21, 'title': 'NeoVision: Advancing Neonatal Care with Smart Infrared & EO Imaging', 'synopsis': 'A project to develop a non-invasive monitoring system for newborns using infrared and electro-optical imaging to track vital signs like body temperature and breathing rate without physical contact.'},
        {'id': 22, 'title': 'Algorithm to Predict the Performance of Students', 'synopsis': 'This project uses machine learning algorithms to analyze various academic and non-academic data of students to predict their future academic performance and identify at-risk students.'},
        {'id': 23, 'title': 'Comparative study and analysis of Marine life data set based on Deep Learning Models and IoT', 'synopsis': 'This project collects marine life data using IoT sensors and analyzes it using various deep learning models to classify species and monitor aquatic environmental health.'},
        {'id': 24, 'title': 'AI/ML based Intrusion detection', 'synopsis': 'Development of a network intrusion detection system (NIDS) that uses machine learning models to analyze network traffic patterns and identify anomalous or malicious activities in real-time.'},
        {'id': 25, 'title': 'Smart systems to bring equality in governance', 'synopsis': 'A conceptual project designing a transparent e-governance platform that uses smart contracts to automate and ensure fair distribution of public services and resources.'},
        {'id': 26, 'title': 'The Application of Discrete Mathematics in Optimizing Network Performance', 'synopsis': 'This project explores how concepts from discrete mathematics, such as graph theory and combinatorics, can be applied to solve network optimization problems like routing and resource allocation.'},
        {'id': 27, 'title': 'Custom kernel functions for domain-specific applications (e.g., bioinformatics, image recognition)', 'synopsis': 'A research project focused on designing and implementing custom kernel functions for Support Vector Machines (SVMs) to improve classification accuracy in specialized domains like bioinformatics.'},
        {'id': 28, 'title': 'Smart Retail Analytics', 'synopsis': 'An analytics platform for retail stores that uses data from cameras and IoT sensors to analyze customer footfall, shopping patterns, and product engagement to optimize store layout.'},
        {'id': 29, 'title': 'Network Performance Evaluation using different Algorithms', 'synopsis': 'This project involves simulating and evaluating the performance of various network routing algorithms (e.g., OSPF, BGP) under different network loads and conditions using a network simulator.'},
        {'id': 30, 'title': 'Optimizing Data Flow in IoT Sensor Networks Using Graph Theory', 'synopsis': 'This project applies graph theory principles to model an IoT sensor network, developing an algorithm to optimize data flow, minimize latency, and conserve energy in the network.'},
        {'id': 31, 'title': 'IoT-based Environmental Monitoring', 'synopsis': 'A system of distributed IoT nodes equipped with sensors to monitor environmental parameters like air quality, temperature, and humidity, and visualize the data on a central dashboard.'},
        {'id': 32, 'title': 'IoT-based Energy Monitoring System', 'synopsis': 'This project aims to build a smart energy meter that tracks household electricity consumption in real-time and provides users with detailed analytics via a mobile app to promote energy saving.'},
        {'id': 33, 'title': 'Hybrid Framework for Distributed Intrusion and Anomaly-Based Secure Routing in IoT Networks', 'synopsis': 'A security framework for IoT networks that combines signature-based intrusion detection with anomaly detection to create a robust, secure routing protocol against a wide range of attacks.'},
        {'id': 34, 'title': 'Developing a Network Traffic Monitoring System Using Wireshark', 'synopsis': 'This project uses Wireshark and its command-line tools to capture and analyze network traffic, developing custom scripts to automate the detection of common network issues and security threats.'},
        {'id': 35, 'title': 'IoT based system for Intelligent based jobs', 'synopsis': 'This project proposes a system that uses IoT devices in a workplace to monitor environmental conditions and worker activity, aiming to automate task allocation and improve overall productivity.'},
        {'id': 36, 'title': 'Algorithmic Design and Analysis of Next-Generation Network Protocols', 'synopsis': 'A theoretical project focused on the design and complexity analysis of new network protocols capable of handling the high-speed and low-latency demands of future internet applications.'},
        {'id': 37, 'title': 'Monitoring community development through IoT technologies', 'synopsis': 'This project outlines a framework for using IoT sensors to track the progress of community development projects, such as monitoring water quality in a new purification plant or usage of new public facilities.'},
        {'id': 38, 'title': 'Innovative Control System for Wheelchair Mobility: Voice Automated Smart Wheel-Chair', 'synopsis': 'Development of a smart wheelchair that can be controlled through voice commands, integrated with sensors for obstacle avoidance to provide greater mobility for disabled individuals.'},
        {'id': 39, 'title': 'Artificial intelligence for drug discovery targeting gene expression pathways', 'synopsis': 'This project uses AI models to analyze large datasets of gene expression pathways and chemical compounds to identify potential new drugs and predict their effectiveness.'},
        {'id': 40, 'title': 'Resilient Urban Intelligence Networks: A Multi-Agent Framework for Critical Infrastructure Management Using Discrete Mathematical Models', 'synopsis': 'A framework using multi-agent systems and discrete math to manage urban infrastructure like power grids and water supply, designed to be resilient against disruptions and failures.'},
        {'id': 41, 'title': 'IoT-enabled Elderly Care System', 'synopsis': "A home monitoring system for the elderly that uses a network of sensors to detect falls, monitor medication schedules, and provide a panic button, all connected to a caregiver's app."},
        {'id': 42, 'title': 'Resilience Analysis of Critical Infrastructure Networks using Graph Theory', 'synopsis': 'This project models critical infrastructure (e.g., power grids, transportation) as a graph and uses graph theory metrics to analyze its resilience and identify key vulnerabilities.'},
        {'id': 43, 'title': 'Machine Learning Based Network Intrusion Detection using Graph Analysis', 'synopsis': 'An intrusion detection system that models network connections as a graph and uses machine learning on graph features to detect complex and distributed cyber-attacks.'},
        {'id': 44, 'title': 'Intrusion Detection and Prevention System (IDPS) Using Machine Learning', 'synopsis': 'This project implements an IDPS that uses supervised machine learning to classify network traffic as either benign or malicious and automatically block threats.'},
        {'id': 45, 'title': 'Gene Expression-based Diagnosis of Neurological Disorders', 'synopsis': 'A computational model that analyzes gene expression data to identify unique signatures associated with various neurological disorders, aiming to create a tool for early diagnosis.'},
        {'id': 46, 'title': 'Integrating Discrete Mathematics and Algorithms for Enhanced Network Security', 'synopsis': 'This project explores the application of discrete mathematics concepts, such as number theory for cryptography, to design and analyze more secure network algorithms.'},
        {'id': 47, 'title': 'Optimization of Network Flow using Advanced Graph Algorithms', 'synopsis': 'Implementation and performance analysis of advanced graph algorithms, like the push-relabel method, to solve the maximum flow problem in a simulated network.'},
        {'id': 48, 'title': 'Packet sniffing and analysis tools', 'synopsis': 'Development of a custom packet sniffing tool using Python libraries like Scapy. The tool will capture, parse, and analyze network packets to identify protocols and potential issues.'},
        {'id': 49, 'title': 'Design and Implementation of a Secure VPN (Virtual Private Network)', 'synopsis': 'This project involves setting up a secure VPN server and client configuration using open-source tools, focusing on strong encryption and authentication protocols to ensure data privacy.'},
        {'id': 50, 'title': 'Smart and Secure Healthcare Monitoring', 'synopsis': "A secure IoT platform for remote patient monitoring, using end-to-end encryption to transmit vital signs from patient sensors to a healthcare provider's dashboard."},
        {'id': 51, 'title': 'Analyzing Information Flow in Communication Networks Using Directed Graphs', 'synopsis': 'This project uses directed graphs to model and analyze the flow of information in a network, identifying bottlenecks and critical nodes using centrality algorithms.'},
        {'id': 52, 'title': 'Intrusion System based on Cisco Packet Tracer', 'synopsis': 'A simulation of various network intrusion scenarios, such as DDoS and Man-in-the-Middle attacks, within Cisco Packet Tracer to study their impact and test defense strategies.'},
        {'id': 53, 'title': 'Algorithmic Community Detection in Dynamic Social Networks', 'synopsis': 'This project focuses on developing an algorithm that can efficiently detect communities or clusters within social networks that change over time, adapting to new and removed connections.'},
        {'id': 54, 'title': 'A Comprehensive Framework for Adaptive Data Compression in IoT Networks', 'synopsis': 'A framework that allows IoT devices to dynamically choose the best data compression algorithm based on the data type and available network bandwidth, optimizing for energy and speed.'},
        {'id': 55, 'title': 'Neural Network-Enhanced Marine Life Education', 'synopsis': 'An educational mobile app that uses a neural network to identify marine species from user-submitted photos, providing information and facts to promote marine life awareness.'},
        {'id': 56, 'title': 'Computational Complexity of Graph-Based Network Analysis', 'synopsis': 'A theoretical analysis of the time and space complexity of common graph algorithms used in network analysis, such as shortest path and minimum spanning tree algorithms.'},
        {'id': 57, 'title': 'Combining SVM with deep learning models (CNN, RNN) for hierarchical feature extraction', 'synopsis': 'A hybrid model that uses Convolutional Neural Networks (CNNs) to extract features from images, which are then fed into a Support Vector Machine (SVM) for a final, robust classification.'},
        {'id': 58, 'title': 'Enhancing Network Security for DDoS Attack Detection in SDN', 'synopsis': 'This project leverages the centralized control of Software-Defined Networking (SDN) to develop a system for rapidly detecting and mitigating Distributed Denial-of-Service (DDoS) attacks.'},
        {'id': 59, 'title': 'Developing Algorithms for Real-time analysis of large scale graphs', 'synopsis': 'The project focuses on creating and implementing scalable algorithms designed for real-time analysis of massive graphs, such as those representing social media networks.'},
        {'id': 60, 'title': 'Performance Analysis of Routing Protocols', 'synopsis': 'A comparative study of different dynamic routing protocols (like RIP, EIGRP, and OSPF) by simulating them in a network environment to measure convergence time and overhead.'},
        {'id': 61, 'title': 'Smart Retail and Inventory Management', 'synopsis': 'An integrated system using RFID tags on products for real-time inventory tracking. The system automates stock alerts and provides data for sales analytics.'},
        {'id': 62, 'title': 'Comparative study of different statistical and computational methods for microarray data analysis', 'synopsis': 'This research project compares various statistical methods for analyzing microarray data to identify differentially expressed genes, evaluating each method for accuracy and computational efficiency.'},
        {'id': 63, 'title': 'Exploring the Mathematical Foundations of Function-Based Cryptography', 'synopsis': 'A theoretical exploration into function-based cryptography, studying its mathematical principles and potential advantages over traditional cryptographic systems.'},
        {'id': 64, 'title': 'Neural networks for shortest path computation and routing in computer networks', 'synopsis': 'This project trains a neural network to solve the shortest path problem in a network, aiming to create a routing model that can adapt to changing network conditions.'},
        {'id': 65, 'title': 'Analyzing the Spread of Influence in Time-Varying Social Networks', 'synopsis': 'A project that models and analyzes how information or influence spreads through a social network that evolves over time, identifying key influencers and propagation patterns.'},
        {'id': 66, 'title': 'Optimization Strategy for Network Lifetime Enhancement in Wireless Sensor Network', 'synopsis': 'Development of an energy-efficient routing protocol for Wireless Sensor Networks (WSNs) that optimizes data transmission paths to maximize the overall lifetime of the network.'},
        {'id': 67, 'title': 'A Comparative Study of Distributed Clustering Algorithms in IoT', 'synopsis': 'This project implements and compares several distributed clustering algorithms for use in IoT networks, evaluating them on criteria such as communication cost, speed, and accuracy.'},
        {'id': 68, 'title': 'AI-Based Anomaly Detection in Network Traffic', 'synopsis': 'An AI model that learns the pattern of normal network traffic and then identifies anomalies that could signify a security breach, network failure, or other unusual event.'},
        {'id': 69, 'title': 'Gene expression signatures in cancer', 'synopsis': 'This project analyzes gene expression data from cancer patients to identify unique molecular signatures for different types of cancer, which can aid in diagnosis and personalized treatment.'},
        {'id': 70, 'title': 'Exploring new multivariate polynomial based digital signature schemes', 'synopsis': 'A research project into the security and efficiency of new digital signature schemes based on the difficulty of solving systems of multivariate polynomial equations.'},
        {'id': 71, 'title': 'Graph Neural Networks for Predictive Analysis of Network Traffic', 'synopsis': 'This project applies Graph Neural Networks (GNNs) to model network infrastructure as a graph, predicting future traffic patterns and potential congestion points.'},
        {'id': 72, 'title': 'IoT-based Smart Mirror for Personal Health Tracking', 'synopsis': 'A smart mirror that displays personalized information like weather, news, and calendar events. It also integrates with health devices to track and display metrics like weight and sleep patterns.'},
        {'id': 73, 'title': 'Modeling and Analysis of Quantum Network Topologies', 'synopsis': 'A theoretical study that models and analyzes different network topologies for future quantum communication networks, focusing on their efficiency for entanglement distribution.'},
        {'id': 74, 'title': 'Smart Parking Management System', 'synopsis': 'An IoT system that uses sensors to detect available parking spots in a lot. A mobile app guides drivers to the nearest empty spot, reducing traffic and search time.'},
        {'id': 75, 'title': 'Polynomial Functional Encryption for Secure Data Sharing', 'synopsis': 'An exploration of functional encryption schemes using polynomials, allowing for secure data sharing where computations can be performed on encrypted data without decrypting it.'},
        {'id': 76, 'title': 'Modeling and Analyzing Transportation Networks Using Graph Theory', 'synopsis': "This project uses graph theory to model a city's transportation network, analyzing it to find optimal routes, traffic flow patterns, and the impact of road closures."},
        {'id': 77, 'title': 'IoT-based Smart Gardening System', 'synopsis': 'An automated gardening system that uses IoT sensors to monitor soil moisture, light, and temperature, and automatically waters the plants as needed.'},
        {'id': 78, 'title': 'Analysis of Information Diffusion in Online Social Networks Using Graph Models', 'synopsis': 'This project models online social networks as graphs to study how information spreads. It aims to identify the key factors that contribute to a piece of content going viral.'},
        {'id': 79, 'title': 'ML based Aqua Fauna Conservation system', 'synopsis': 'A system that uses machine learning to analyze underwater audio recordings and images to monitor the population and behavior of aquatic animals for conservation purposes.'},
        {'id': 80, 'title': 'IoT-enabled Secure Home Automation', 'synopsis': 'A secure home automation system that allows users to control lights, locks, and appliances remotely, with a focus on encrypted communication to prevent unauthorized access.'},
        {'id': 81, 'title': 'Smart Supply Chain Management', 'synopsis': 'A supply chain management system that uses IoT and blockchain to provide real-time tracking of goods from manufacturer to consumer, ensuring transparency and authenticity.'}
    ]


    # --- 4. EXECUTE SEEDING ---
    db = SessionLocal()
    try:
        print("Dropping old 'existing_projects' table (if it exists)...")
        # Drop the table if it exists to ensure a clean slate
        ExistingProject.__table__.drop(engine, checkfirst=True)

        print("Creating new 'existing_projects' table...")
        # Create the table based on the model definition
        Base.metadata.create_all(bind=engine)

        print(f"Inserting {len(projects_data)} projects into the database...")
        # Create a list of Project objects to be inserted
        projects_to_insert = [ExistingProject(**data) for data in projects_data]
        
        # Add all projects to the session
        db.add_all(projects_to_insert)
        
        # Commit the transaction to save the data
        db.commit()
        print("✅ Data seeding successful!")

    except Exception as e:
        print(f"❌ An error occurred: {e}")
        db.rollback()
    finally:
        db.close()
        print("Database connection closed.")


# --- 5. RUN THE SCRIPT ---
if __name__ == "__main__":
    seed_data()