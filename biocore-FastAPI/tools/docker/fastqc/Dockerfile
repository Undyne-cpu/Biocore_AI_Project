FROM ccr.ccs.tencentyun.com/library/ubuntu:22.04

LABEL maintainer="BioCore Team"
LABEL description="FastQC Quality Control Tool"
LABEL version="0.11.9"

# Install FastQC dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jre \
    perl \
    default-jre \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Download and install FastQC directly from official site
ENV FASTQC_VERSION=0.11.9
RUN wget -q https://www.bioinformatics.babraham.ac.uk/projects/fastqc/fastqc_v${FASTQC_VERSION}.zip && \
    unzip -q fastqc_v${FASTQC_VERSION}.zip -d /opt/ && \
    mv /opt/FastQC /opt/fastqc && \
    chmod +x /opt/fastqc/fastqc && \
    ln -s /opt/fastqc/fastqc /usr/local/bin/fastqc && \
    rm fastqc_v${FASTQC_VERSION}.zip

# Create working directories
RUN mkdir -p /data/input /data/output && chmod 777 /data/input /data/output

WORKDIR /data

CMD ["fastqc", "--help"]