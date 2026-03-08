FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && apt-get clean

ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Overwrite installed carball with our fixed version
COPY carball/ /usr/local/lib/python3.9/site-packages/carball/

COPY . .

COPY rrrocket /app/rrrocket
RUN chmod +x /app/rrrocket

EXPOSE 10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]